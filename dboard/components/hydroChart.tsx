import React, { Component } from "react";
import {
  Area,
  Label,
  Scatter,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceArea,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";

export type HydroEntry = {
  date: string;
  observed: number | null;
  estimated: number;
  error_band: [number, number];
};

const getAxisYDomain = (
  from: string,
  to: string,
  ref: string,
  offset: number,
  data: HydroEntry[]
) => {
  const refData = data.filter(
    (entry) => entry.date >= from && entry.date <= to
  );

  let [bottom, top] = [refData[0][ref], refData[0][ref]];
  refData.forEach((d) => {
    if (d[ref] > top) top = d[ref];
    if (d[ref] < bottom) bottom = d[ref];
  });

  return [(bottom | 0) - offset, (top | 0) + offset];
};

interface GraphState {
  data: HydroEntry[];
  left: string;
  right: string;
  refAreaLeft: string;
  refAreaRight: string;
  top: string;
  bottom: string;
  animation: boolean;
}

const initialState: GraphState = {
  data: [],
  left: "dataMin",
  right: "dataMax",
  refAreaLeft: "",
  refAreaRight: "",
  top: "dataMax+1",
  bottom: "dataMin-1",
  animation: true,
};

interface HydroChartProps {
  message: string;
  data: HydroEntry[];
}

export class HydroChart extends Component<HydroChartProps> {
  state: GraphState;

  constructor(props: HydroChartProps) {
    super(props);
    this.state = initialState;
    this.state.data = props.data;
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
    if (refAreaLeft && refAreaLeft > refAreaRight)
      [refAreaLeft, refAreaRight] = [refAreaRight, refAreaLeft];

    console.log("refAreaLeft", refAreaLeft);
    console.log("refAreaRight", refAreaRight);

    // yAxis domain
    const [bottom, top] = getAxisYDomain(
      refAreaLeft,
      refAreaRight,
      "estimated",
      1,
      data
    );
    this.setState(() => ({
      refAreaLeft: "",
      refAreaRight: "",
      data: data.slice(),
      left: refAreaLeft,
      right: refAreaRight,
      bottom,
      top,
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
    } = this.state;

    console.log("render", refAreaLeft, refAreaRight, left, right);

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
            <XAxis allowDataOverflow dataKey="date" domain={[left, right]} />
            <Area
              type="monotone"
              dataKey="error_band"
              stroke="none"
              fill="#A7D8DE"
              connectNulls
              dot={false}
              activeDot={false}
              yAxisId="1"
            />
            <YAxis
              allowDataOverflow
              domain={[bottom, top]}
              type="number"
              yAxisId="1"
            />
            {/* <YAxis
              orientation="right"
              allowDataOverflow
              domain={[bottom2, top2]}
              type="number"
              yAxisId="2"
            /> */}
            <Tooltip />
            <Line
              yAxisId="1"
              type="monotone"
              dot={false}
              dataKey="estimated"
              stroke="#31768D"
              animationDuration={300}
            />
            <Scatter
              yAxisId="1"
              width={1}
              type="monotone"
              dataKey="observed"
              stroke="#aaa"
              animationDuration={300}
            />
            {/* <Line
              yAxisId="2"
              type="natural"
              dataKey="impression"
              stroke="#82ca9d"
              animationDuration={300}
            /> */}

            {refAreaLeft && refAreaRight ? (
              <ReferenceArea
                yAxisId="1"
                x1={refAreaLeft}
                x2={refAreaRight}
                strokeOpacity={0.2}
              />
            ) : null}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    );
  }

  shouldComponentUpdate(
    nextProps: Readonly<HydroChartProps>,
    nextState: Readonly<{}>,
    nextContext: any
  ): boolean {
    this.state.data = nextProps.data;
    return true;
  }
}
