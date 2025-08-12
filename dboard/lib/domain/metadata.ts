import Station from "./station";
import Units from "./units";
import Var from "./var";

type Metadata = {
  estacion: Station;
  var: Var;
  unidades: Units;
  percentiles_ref: Record<number, number>;
};

export default Metadata;
