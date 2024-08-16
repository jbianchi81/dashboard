import React, { Component } from "react";
import Button from "@mui/material/Button";
import {
  Area,
  Legend,
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
import { CurrentPngProps } from "recharts-to-png";
import FileSaver from "file-saver";
import _ from "lodash";

export type HydroEntry = {
  date: number;
  observed: number | null;
  estimated: number | null;
  error_band: [number, number] | null;
};

type Estimation = { time: string; value: number };
type Observation = { timestart: string; valor: number };

export function buildHydroEntries(
  estimated: Estimation[],
  observations: Observation[],
  low_band: Estimation[],
  high_band: Estimation[]
): HydroEntry[] {
  const est = _.groupBy(estimated, "time");
  const obs = _.groupBy(observations, "timestart");
  const lo = _.groupBy(low_band, "time");
  const hi = _.groupBy(high_band, "time");
  const [a, b, c, d] = [
    new Set(Object.keys(est)),
    new Set(Object.keys(lo)),
    new Set(Object.keys(hi)),
    new Set(Object.keys(obs)),
  ];
  const allDates = a.union(b).union(c).union(d);
  let entries: HydroEntry[] = [];
  for (let date of allDates) {
    let entry: HydroEntry = {
      date: new Date(date).getTime(),
      observed: obs[date]?.[0]?.valor || null,
      estimated: est[date]?.[0]?.value || null,
      error_band: [lo[date]?.[0]?.value, hi[date]?.[0]?.value],
    };
    entries.push(entry);
  }
  return entries;
}

const getAxisYDomain = (
  from: number,
  to: number,
  offset: number,
  data: HydroEntry[]
) => {
  const refData = data.filter(
    (entry) => entry.date >= from && entry.date <= to
  );

  let [bottom, top] = [
    refData[0]["error_band"]?.[0] || 0,
    refData[0]["error_band"]?.[1] || 0,
  ];
  refData.forEach((d) => {
    let ref: keyof HydroEntry = "error_band";
    if (d[ref]?.[1] && d[ref][1] > top) {
      top = d[ref][1];
    }
    if (d[ref]?.[0] && d[ref][0] < bottom) {
      bottom = d[ref][0];
    }
  });

  return [(bottom | 0) - offset, (top | 0) + offset];
};

interface GraphState {
  data: HydroEntry[];
  left: string;
  right: string;
  refAreaLeft: number | "";
  refAreaRight: number | "";
  top: string;
  bottom: string;
  animation: boolean;
  pngProps: CurrentPngProps;
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
  pngProps: [] as unknown as CurrentPngProps,
};

interface HydroChartProps {
  data: HydroEntry[];
  pngProps: CurrentPngProps;
}

export class HydroChart extends Component<HydroChartProps> {
  state: GraphState;

  constructor(props: HydroChartProps) {
    super(props);
    this.state = initialState;
    this.state.data = props.data;
    this.state.pngProps = props.pngProps;
  }

  zoom() {
    let { refAreaLeft, refAreaRight } = this.state;
    const { data } = this.state;

    if (
      refAreaLeft === refAreaRight ||
      refAreaRight === "" ||
      refAreaLeft === ""
    ) {
      this.setState(() => ({
        refAreaLeft: "",
        refAreaRight: "",
      }));
      return;
    }

    // xAxis domain
    if (refAreaLeft && refAreaLeft > refAreaRight)
      [refAreaLeft, refAreaRight] = [refAreaRight, refAreaLeft];

    // yAxis domain
    const [bottom, top] = getAxisYDomain(refAreaLeft, refAreaRight, 1, data);
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
      bottom: "dataMin-1",
    }));
  }

  handleDownload = async () => {
    const png = await this.props.pngProps.getPng();
    if (png) {
      FileSaver.saveAs(png, "altura-hidrometrica.png");
    }
  };

  render() {
    const { data, left, right, refAreaLeft, refAreaRight, top, bottom } =
      this.state;

    return (
      <div
        className="highlight-bar-charts"
        style={{ userSelect: "none", width: "100%" }}
      >
        <Button
          size="small"
          variant="outlined"
          onClick={this.zoomOut.bind(this)}
          sx={{ mb: 2, mr: 2 }}
        >
          Alejar
        </Button>
        <Button
          size="small"
          variant="outlined"
          onClick={() => this.handleDownload()}
          sx={{ mb: 2, mr: 2 }}
        >
          Descargar gráfico
        </Button>
        <Button size="small" variant="outlined" sx={{ mb: 2 }}>
          Descargar CSV
        </Button>

        <ResponsiveContainer width={1000} height={450}>
          <ComposedChart
            margin={{ right: 10, left: 20 }}
            data={data}
            onMouseDown={(e) => this.setState({ refAreaLeft: e.activeLabel })}
            onMouseMove={(e) =>
              this.state.refAreaLeft &&
              this.setState({ refAreaRight: e.activeLabel })
            }
            onMouseUp={this.zoom.bind(this)}
            ref={this.props.pngProps.chartRef}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              allowDataOverflow
              dataKey="date"
              domain={[left, right]}
              tickCount={10}
              tickFormatter={(unixTime) =>
                new Date(unixTime).toLocaleDateString("en-GB")
              }
              type="number"
            />
            <Area
              type="monotone"
              dataKey="error_band"
              stroke="none"
              name="Banda de error"
              fill="#A7D8DE"
              connectNulls
              dot={false}
              activeDot={false}
              yAxisId="1"
              animationDuration={300}
            />
            <YAxis
              allowDataOverflow
              domain={[bottom, top]}
              type="number"
              yAxisId="1"
              label={{
                value: "Nivel (m)",
                angle: -90,
                position: "insideLeft",
              }}
              tickCount={10}
              tickFormatter={(tick) => {
                return tick.toFixed(1);
              }}
            />
            <Tooltip
              labelFormatter={(x) => new Date(x).toLocaleString("en-GB")}
            />
            <Legend
              width={170}
              layout="vertical"
              wrapperStyle={{
                top: 10,
                right: 20,
                backgroundColor: "#f5f5f5",
                border: "1px solid #d5d5d5",
                borderRadius: 3,
              }}
            />
            <Line
              yAxisId="1"
              type="monotone"
              dot={false}
              dataKey="estimated"
              name="Nivel pronosticado"
              stroke="#01599b"
              animationDuration={300}
            />
            <Scatter
              yAxisId="1"
              width={1}
              type="monotone"
              dataKey="observed"
              name="Nivel observado"
              stroke="#aaa"
              animationDuration={300}
            />
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
