import React, { Component } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { CurrentPngProps } from "recharts-to-png";
import FileSaver from "file-saver";
import CsvDownloader from "react-csv-downloader";
import _ from "lodash";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

export type WindEntry = {
  date: number;
  wind_direction_obs: number | null;
  wind_velocity_obs: number | null;
};

type Observation = { timestart: string; valor: number };

export function buildWindEntries(
  wind_direction_obs: Observation[],
  wind_velocity_obs: Observation[]
): WindEntry[] {
  const dir = _.groupBy(wind_direction_obs, "timestart");
  const vel = _.groupBy(wind_velocity_obs, "timestart");

  const [a, b] = [new Set(Object.keys(dir)), new Set(Object.keys(vel))];
  const allDates = a.union(b);
  let entries: WindEntry[] = [];
  for (let date of allDates) {
    let entry: WindEntry = {
      date: new Date(date).getTime(),
      wind_direction_obs: dir[date]?.[0]?.valor || null,
      wind_velocity_obs: vel[date]?.[0]?.valor || null,
    };
    entries.push(entry);
  }
  return entries;
}

interface GraphState {
  data: WindEntry[];
  left: string;
  right: string;
  refAreaLeft: number | "";
  refAreaRight: number | "";
  top: string;
  bottom: string;
  animation: boolean;
  pngProps: CurrentPngProps;
  height: number;
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
  height: 1,
  pngProps: [] as unknown as CurrentPngProps,
};

interface WindChartProps {
  data: WindEntry[];
  height: number;
  pngProps: CurrentPngProps;
}

export class WindChart extends Component<WindChartProps> {
  state: GraphState;

  constructor(props: WindChartProps) {
    super(props);
    this.state = initialState;
    this.state.data = props.data;
    this.state.height = props.height;
    this.state.pngProps = props.pngProps;
  }

  handleDownload = async () => {
    const png = await this.props.pngProps.getPng();
    if (png) {
      FileSaver.saveAs(png, "direccion-y-velocidad-viento.png");
    }
  };

  render() {
    const {
      data,
      left,
      right,
      refAreaLeft,
      refAreaRight,
      top,
      bottom,
      height,
    } = this.state;

    // CSV creation

    const columns = [
      {
        id: "date",
        displayName: "Fecha",
      },
      {
        id: "wind_direction_obs",
        displayName: "Dirección del viento",
      },
      {
        id: "wind_velocity_obs",
        displayName: "Velocidad del viento",
      },
    ];

    const datas = () => {
      const all: any = [];
      data.map((d) => {
        const aux = {
          date: new Date(d.date).toISOString(),
          wind_direction_obs: d.wind_direction_obs,
          wind_velocity_obs: d.wind_velocity_obs,
        };
        all.push(aux);
      });
      return all;
    };

    return (
      <div
        className="highlight-bar-charts"
        style={{ userSelect: "none", width: "100%" }}
      >
        <ResponsiveContainer width="100%" height={height}>
          <LineChart
            margin={{ right: 10, left: 20 }}
            data={data}
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
            <YAxis
              yAxisId="left"
              allowDataOverflow
              domain={[bottom, top]}
              type="number"
              label={{
                value: "Dirección del viento",
                angle: -90,
                position: "insideLeft",
                offset: -10,
              }}
              tickCount={10}
              tickFormatter={(tick) => {
                return tick.toFixed(1);
              }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              allowDataOverflow
              domain={[bottom, top]}
              type="number"
              label={{
                value: "Velocidad del viento",
                angle: -90,
                position: "insideLeft",
                offset: 60,
              }}
              tickCount={10}
              tickFormatter={(tick) => {
                return tick.toFixed(1);
              }}
            />
            <Tooltip
              labelFormatter={(x) => new Date(x).toLocaleString("en-GB")}
              formatter={(x) => Number(x).toFixed(2)}
            />
            <Legend
              width={180}
              layout="vertical"
              wrapperStyle={{
                top: 10,
                right: 90,
                backgroundColor: "#f5f5f5",
                border: "1px solid #d5d5d5",
                borderRadius: 3,
              }}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="wind_direction_obs"
              dot={false}
              name="Dirección del viento"
              stroke="#01599b"
              animationDuration={300}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="wind_velocity_obs"
              stroke="#8ad3e0"
              dot={false}
              name="Velocidad del viento"
              animationDuration={300}
            />
          </LineChart>
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
            onClick={() => this.handleDownload()}
            sx={{ mr: 2 }}
          >
            Descargar gráfico
          </Button>
          <CsvDownloader
            filename="pronostico-viento"
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
    nextProps: Readonly<WindChartProps>,
    nextState: Readonly<{}>,
    nextContext: any
  ): boolean {
    this.state.data = nextProps.data;
    return true;
  }
}
