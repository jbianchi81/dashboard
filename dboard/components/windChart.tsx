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
import _ from "lodash";

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

interface WindChartProps {
  data: WindEntry[];
}

export class WindChart extends Component<WindChartProps> {
  state: GraphState;

  constructor(props: WindChartProps) {
    super(props);
    this.state = initialState;
    this.state.data = props.data;
  }

  render() {
    const { data, left, right, refAreaLeft, refAreaRight, top, bottom } =
      this.state;

    return (
      <ResponsiveContainer width="100%" height={600}>
        <LineChart margin={{ right: 10, left: 20 }} data={data}>
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
              position: "outsideLeft",
              offset: 10,
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
