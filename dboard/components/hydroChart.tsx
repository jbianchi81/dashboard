import React, { PureComponent } from "react";
import {
  Area,
  Label,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceArea,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";

const initialData = [
  { name: 1, cost: 4.11, impression: 100, a: [95, 110] },
  { name: 2, cost: 2.39, impression: 120, a: [98, 125] },
  { name: 3, cost: 1.37, impression: 150, a: [140, 160] },
  { name: 4, cost: 1.16, impression: 180, a: [175, 200] },
  { name: 5, cost: 2.29, impression: 200, a: [190, 210] },
  { name: 6, cost: 3, impression: 499, a: [450, 550] },
];

const getAxisYDomain = (from, to, ref, offset) => {
  const refData = initialData.slice(from - 1, to);
  let [bottom, top] = [refData[0][ref], refData[0][ref]];
  refData.forEach((d) => {
    if (d[ref] > top) top = d[ref];
    if (d[ref] < bottom) bottom = d[ref];
  });

  return [(bottom | 0) - offset, (top | 0) + offset];
};

const initialState = {
  data: initialData,
  left: "dataMin",
  right: "dataMax",
  refAreaLeft: "",
  refAreaRight: "",
  top: "dataMax+1",
  bottom: "dataMin-1",
  top2: "dataMax+20",
  bottom2: "dataMin-20",
  animation: true,
};

interface HydroChartProps {
  message: string;
}

export default class HydroChart extends PureComponent<HydroChartProps> {
  static demoUrl =
    "https://codesandbox.io/p/sandbox/highlight-zoom-line-chart-rrj8f4";

  constructor(props: HydroChartProps) {
    super(props);
    console.log(props);
    this.state = initialState;
  }

  zoom() {
    let { refAreaLeft, refAreaRight } = this.state;
    const { data } = this.state;

    if (refAreaLeft === refAreaRight || refAreaRight === "") {
      this.setState(() => ({
        refAreaLeft: "",
        refAreaRight: "",
      }));
      return;
    }

    // xAxis domain
    if (refAreaLeft > refAreaRight)
      [refAreaLeft, refAreaRight] = [refAreaRight, refAreaLeft];

    // yAxis domain
    const [bottom, top] = getAxisYDomain(refAreaLeft, refAreaRight, "cost", 1);
    const [bottom2, top2] = getAxisYDomain(
      refAreaLeft,
      refAreaRight,
      "impression",
      50
    );

    this.setState(() => ({
      refAreaLeft: "",
      refAreaRight: "",
      data: data.slice(),
      left: refAreaLeft,
      right: refAreaRight,
      bottom,
      top,
      bottom2,
      top2,
    }));
  }

  zoomOut() {
    const { data } = this.state;
    this.setState(() => ({
      data: data.slice(),
      refAreaLeft: "",
      refAreaRight: "",
      left: "dataMin",
      right: "dataMax",
      top: "dataMax+1",
      bottom: "dataMin",
      top2: "dataMax+50",
      bottom2: "dataMin+50",
    }));
  }

  render() {
    const {
      data,
      barIndex,
      left,
      right,
      refAreaLeft,
      refAreaRight,
      top,
      bottom,
      top2,
      bottom2,
    } = this.state;

    return (
      <div
        className="highlight-bar-charts"
        style={{ userSelect: "none", width: "100%" }}
      >
        <button
          type="button"
          className="btn update"
          onClick={this.zoomOut.bind(this)}
        >
          Alejar
        </button>

        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart
            width={800}
            height={400}
            data={data}
            onMouseDown={(e) => this.setState({ refAreaLeft: e.activeLabel })}
            onMouseMove={(e) =>
              this.state.refAreaLeft &&
              this.setState({ refAreaRight: e.activeLabel })
            }
            onMouseUp={this.zoom.bind(this)}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              allowDataOverflow
              dataKey="name"
              domain={[left, right]}
              type="number"
            />
            <Area
              type="monotone"
              dataKey="a"
              stroke="none"
              fill="#aaffaa"
              connectNulls
              dot={false}
              activeDot={false}
              yAxisId="2"
            />
            <YAxis
              allowDataOverflow
              domain={[bottom, top]}
              type="number"
              yAxisId="1"
            />
            <YAxis
              orientation="right"
              allowDataOverflow
              domain={[bottom2, top2]}
              type="number"
              yAxisId="2"
            />
            <Tooltip />
            <Line
              yAxisId="1"
              type="natural"
              dataKey="cost"
              stroke="#8884d8"
              animationDuration={300}
            />
            <Line
              yAxisId="2"
              type="natural"
              dataKey="impression"
              stroke="#82ca9d"
              animationDuration={300}
            />

            {refAreaLeft && refAreaRight ? (
              <ReferenceArea
                yAxisId="1"
                x1={refAreaLeft}
                x2={refAreaRight}
                strokeOpacity={0.3}
              />
            ) : null}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    );
  }
}
