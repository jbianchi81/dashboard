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
};

export default Preset;
