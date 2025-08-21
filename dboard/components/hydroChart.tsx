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
  ReferenceLine,
  Label,
} from "recharts";
import { CurrentPngProps } from "recharts-to-png";
import FileSaver from "file-saver";
import CsvDownloader from "react-csv-downloader";
import _ from "lodash";
import Box from "@mui/material/Box";

export type HydroEntry = {
  date: number;
  observed: number | null;
  estimated: number | null;
  error_band: [number, number] | null;
  aux: (number | null)[];
};

type Estimation = { time: string; value: number };
type Observation = { timestart: string; valor: number };

export function flattenHydroEntries(entries : HydroEntry[], auxColumns : string[]) : any[] {
  return entries.map(e => {
    const entry : any = {
      date: e.date,
      observed: e.observed,
      estimated: e.estimated,
      error_band: e.error_band
    }
    for(var i=0; i< auxColumns.length; i++) {
      entry[`aux_${i}`] = (e.aux.length - 1 >= i) ? e.aux[i] : null
    }
    return entry
  })
}

export function buildHydroEntries(
  estimated: Estimation[],
  observations: Observation[],
  low_band: Estimation[],
  high_band: Estimation[],
  series_auxiliares: Observation[][] | null
): HydroEntry[] {
  const est = _.groupBy(estimated, "time");
  const obs = _.groupBy(observations, "timestart");
  const lo = _.groupBy(low_band, "time");
  const hi = _.groupBy(high_band, "time");
  const aux = (series_auxiliares) ? series_auxiliares.map(s => _.groupBy(s, "timestart")) : []
  const [a, b, c, d, e] = [
    new Set(Object.keys(est)),
    new Set(Object.keys(lo)),
    new Set(Object.keys(hi)),
    new Set(Object.keys(obs)),
    aux.map(a => new Set(Object.keys(a))).reduce((acc, s) => {
      for (const v of s) acc.add(v);
      return acc;
    }, new Set())
  ];
  const allDates = a.union(b).union(c).union(d).union(e);
  let entries: HydroEntry[] = [];
  for (let date of allDates) {
    let entry: HydroEntry = {
      date: new Date(date).getTime(),
      observed: obs[date]?.[0]?.valor || null,
      estimated: est[date]?.[0]?.value || null,
      error_band: [lo[date]?.[0]?.value, hi[date]?.[0]?.value],
      aux: aux.map(a => a[date]?.[0]?.valor || null)
    };
    entries.push(entry);
  }
  return entries;
}

const entryMaxValue = (entry: HydroEntry) => {
  return Math.max(
    entry["error_band"]?.[1] || 0,
    entry["estimated"] || 0,
    entry["observed"] || 0
  );
};

const entryMinValue = (entry: HydroEntry) => {
  return Math.min(
    entry["error_band"]?.[0] || 0,
    entry["estimated"] || 0,
    entry["observed"] || 0
  );
};

const getAxisYDomain = (
  from: number,
  to: number,
  offset: number,
  data: HydroEntry[]
) => {
  const [bottom, top] = data
    .filter((entry) => entry.date >= from && entry.date <= to)
    .reduceRight(
      ([bottom, top], entry) => {
        return [
          Math.min(bottom, entryMinValue(entry)),
          Math.max(top, entryMaxValue(entry)),
        ];
      },
      [Infinity, -Infinity]
    );

  return [(bottom | 0) - offset, (top | 0) + offset];
};

interface GraphState {
  data: HydroEntry[];
  left: string | number;
  right: string | number;
  refAreaLeft: number | "";
  refAreaRight: number | "";
  top: string;
  bottom: string;
  animation: boolean;
  pngProps: CurrentPngProps;
  height: number;
  refLines: RefLines;
  auxColumns: string[];
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
  height: 1,
  refLines: {
    bottom: 0.5,
    low: 0.8,
    up: 4.0,
    top: 5.1
  },
  auxColumns: []
};

interface RefLines {
  bottom: number | null;
  low: number | null;
  up: number | null;
  top: number | null;
}

interface HydroChartProps {
  data: HydroEntry[];
  pngProps: CurrentPngProps;
  height: number;
  forecastDate: string;
  refLines: RefLines;
  timeStart? : Date;
  timeEnd? : Date;
  auxColumns? : string[]
}

export function getPronosByQualifier(series : Serie[], qualifier : string) : Estimation[] {
  // error_band_01
  const index = series.map(s => s.qualifier).indexOf(qualifier)
  if(index < 0) {
    throw new Error("Missing the required qualifier " + qualifier)
  }
  return series[index].pronosticos
}

type Serie = {
  series_id : number;
  qualifier : string;
  pronosticos : Estimation[]
}

const strokes : string[] = [
  "#FF0000", // Red
  "#00FF00", // Lime
  "#0000FF", // Blue
  "#FFFF00", // Yellow
  "#00FFFF", // Cyan / Aqua
  "#FF00FF", // Magenta / Fuchsia
  "#C0C0C0", // Silver
  "#808080", // Gray
  "#800000", // Maroon
  "#808000", // Olive
  "#008000", // Green
  "#800080", // Purple
  "#008080", // Teal
  "#000080", // Navy
  "#FFA500", // Orange
  "#FFC0CB", // Pink
  "#D2691E", // Chocolate
  "#F5DEB3", // Wheat
  "#4B0082", // Indigo
  "#ADD8E6", // LightBlue
];


export class HydroChart extends Component<HydroChartProps> {
  state: GraphState;

  constructor(props: HydroChartProps) {
    super(props);
    this.state = initialState;
    this.state.data = props.data;
    this.state.pngProps = props.pngProps;
    this.state.height = props.height;
    this.state.refLines = (props.refLines) ? props.refLines : this.state.refLines
    this.state.left = (props.timeStart) ? props.timeStart.getTime() : this.state.left 
    this.state.left = (props.timeEnd) ? props.timeEnd.getTime() : this.state.left
    this.state.auxColumns = (props.auxColumns) ? props.auxColumns : [] 
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
    let { data, left, right, refAreaLeft, refAreaRight, top, bottom, height, refLines, auxColumns } =
      this.state;

    // CSV creation

    const columns = [
      {
        id: "date",
        displayName: "Fecha",
      },
      {
        id: "obs",
        displayName: "Nivel observado",
      },
      {
        id: "sim",
        displayName: "Nivel pronosticado",
      },
      {
        id: "bottomError",
        displayName: "Banda de error inferior",
      },
      {
        id: "topError",
        displayName: "Banda de error superior",
      },
      ...auxColumns.map((c,i) => { 
        return {
          id: `aux_${i}`, 
          displayName: c
        }
      })
    ];

    const datas = () => {
      const all: any = [];
      data.map((d) => {
        const aux : any = {
          date: new Date(d.date).toISOString(),
          obs: d.observed,
          sim: d.estimated,
          bottomError: d.error_band ? d.error_band[0] : null,
          topError: d.error_band ? d.error_band[1] : null,
        };
        for(var i = 0; i < auxColumns.length; i++) {
          aux[`aux_${i}`] = (d.aux.length - 1 >= i) ? d.aux[i] : null
        }
        all.push(aux);
      });
      return all;
    };

    const fdate = new Date(this.props.forecastDate).getTime();
    const fdateLabel = `Fecha de emisión del pronóstico: ${new Date(
      fdate
    ).toLocaleString("en-GB")}`;

    return (
      <div
        className="highlight-bar-charts"
        style={{ userSelect: "none", width: "100%" }}
      >
        <ResponsiveContainer width="100%" height={height}>
          <ComposedChart
            margin={{ right: 10, left: 20 }}
            data={flattenHydroEntries(data, auxColumns)}
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
              domain={[
                (dmin: number) => Math.min(dmin - 1, (refLines.bottom !== null) ? refLines.bottom - 0.4 : dmin - 1),
                (dmax: number) => Math.max(dmax + 1, (refLines.top !== null) ? refLines.top + 0.4 : dmax + 1),
              ]}
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
              formatter={(x: string, key: string) => {
                if (key !== "Banda de error") {
                  return parseFloat(x).toFixed(2);
                } else {
                  let [a, b] = x;
                  if (a && b) {
                    return `${parseFloat(a).toFixed(2)}, ${parseFloat(
                      b
                    ).toFixed(2)}`;
                  } else {
                    return "";
                  }
                }
              }}
            />
            <ReferenceLine
              x={fdate}
              yAxisId="1"
              stroke="#014475"
              strokeDasharray="3 3"
            >
              <Label
                value={fdateLabel}
                position="insideBottom"
                fill="#014475"
                offset={20}
              />
            </ReferenceLine>
            { refLines.low !== null && <ReferenceLine
                y={refLines.low}
                yAxisId="1"
                stroke="#FFCB47"
                strokeDasharray="15 3"
              >
                <Label position="insideBottom" fill="#014475" offset={20} />
              </ReferenceLine> }
            { refLines.up !== null && <ReferenceLine
                y={refLines.up}
                yAxisId="1"
                stroke="#FFCB47"
                strokeDasharray="15 3"
              >
                <Label position="insideBottom" fill="#014475" offset={20} />
              </ReferenceLine> }
            { refLines.bottom !== null && <ReferenceLine
                y={refLines.bottom}
                yAxisId="1"
                stroke="#B80C09"
                strokeDasharray="15 3"
              >
                <Label position="insideBottom" fill="#014475" offset={20} />
              </ReferenceLine> }
            { refLines.top !== null && <ReferenceLine
                y={refLines.top}
                yAxisId="1"
                stroke="#B80C09"
                strokeDasharray="15 3"
              >
                <Label position="insideBottom" fill="#014475" offset={20} />
              </ReferenceLine> }
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
            {auxColumns.map((c,i) => (
              <Scatter
              yAxisId="1"
              width={1}
              type="monotone"
              dataKey={`aux_${i}`}
              name={c}
              stroke={strokes[i]}
              fill={strokes[i]}
              animationDuration={300}
            />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            mt: -5,
          }}
        >
          <Button
            size="small"
            variant="outlined"
            onClick={this.zoomOut.bind(this)}
            sx={{ mr: 2 }}
          >
            Alejar
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => this.handleDownload()}
            sx={{ mr: 2 }}
          >
            Descargar gráfico
          </Button>
          <CsvDownloader
            filename="altura-hidrometrica"
            extension=".csv"
            separator=";"
            wrapColumnChar=""
            columns={columns}
            datas={datas}
          >
            <Button size="small" variant="outlined">
              Descargar CSV
            </Button>
          </CsvDownloader>
        </Box>
      </div>
    );
  }

  shouldComponentUpdate(
    nextProps: Readonly<HydroChartProps>,
    nextState: Readonly<{}>,
    nextContext: any
  ): boolean {
    this.state.data = nextProps.data;
    this.state.refLines = nextProps.refLines;
    this.state.left = (nextProps.timeStart) ? nextProps.timeStart.getTime() : this.state.left;
    this.state.right = (nextProps.timeEnd) ? nextProps.timeEnd.getTime() : this.state.right;
    this.state.auxColumns = (nextProps.auxColumns) ? nextProps.auxColumns : this.state.auxColumns;
    return true;
  }
}
