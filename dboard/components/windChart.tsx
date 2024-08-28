import React, { Component, FunctionComponent } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CurrentPngProps } from "recharts-to-png";
import FileSaver from "file-saver";
import CsvDownloader from "react-csv-downloader";
import _ from "lodash";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import NorthIcon from "@mui/icons-material/North";
import NorthEastIcon from "@mui/icons-material/NorthEast";
import NorthWestIcon from "@mui/icons-material/NorthWest";
import SouthIcon from "@mui/icons-material/South";
import SouthEastIcon from "@mui/icons-material/SouthEast";
import SouthWestIcon from "@mui/icons-material/SouthWest";
import EastIcon from "@mui/icons-material/East";
import WestIcon from "@mui/icons-material/West";

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

    const CustomizedDot: FunctionComponent<any> = (props: any) => {
      const { cx, cy, value, payload } = props;
      const windDir = payload.wind_direction_obs;
      const north = <SouthIcon color="primary" />;
      const northEast = <SouthWestIcon color="primary" />;
      const east = <WestIcon color="primary" />;
      const southEast = <NorthWestIcon color="primary" />;
      const south = <NorthIcon color="primary" />;
      const southWest = <NorthEastIcon color="primary" />;
      const west = <EastIcon color="primary" />;
      const northWest = <SouthEastIcon color="primary" />;

      function assignIcon() {
        switch (true) {
          case windDir >= 337.5 || windDir < 22.5:
            return north;
          case windDir >= 22.5 && windDir < 67.5:
            return northEast;
          case windDir >= 67.5 && windDir < 112.5:
            return east;
          case windDir >= 112.5 && windDir < 157.5:
            return southEast;
          case windDir >= 157.5 && windDir < 202.5:
            return south;
          case windDir >= 202.5 && windDir < 247.5:
            return southWest;
          case windDir >= 247.5 && windDir < 292.5:
            return west;
          case windDir >= 292.5 && windDir < 337.5:
            return northWest;
        }
      }

      return (
        <svg
          x={cx - 10}
          y={cy - 10}
          width={20}
          height={20}
          viewBox="0 0 1024 1024"
        >
          {assignIcon()}
        </svg>
      );
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
              allowDataOverflow
              domain={[bottom, top]}
              type="number"
              label={{
                value: "Velocidad del viento (m/s)",
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
              formatter={(x) => Number(x).toFixed(2)}
            />
            <Line
              type="monotone"
              dataKey="wind_velocity_obs"
              stroke="#52b5c7"
              dot={<CustomizedDot />}
              name="Velocidad del viento"
              animationDuration={300}
            />
          </LineChart>
        </ResponsiveContainer>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            mt: 4,
            mb: 4,
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
