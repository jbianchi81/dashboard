import RefLines from './ref_lines'

type Preset = {
    type: string
    seriesIdObs : number
    nombre_estacion : string
    calId? : number
    seriesIdSim? : number
    timeStartDays? : number
    timeEndDays? : number
    mainQualifier? : string
    errorBandLow? : string
    errorBandHigh? : string
    refLines? : RefLines
    title? : string
};

export default Preset;
