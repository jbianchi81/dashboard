import RefLines from './ref_lines'
import SerieAuxiliar from './serieAuxiliar'

type DataPage = {
    id: string
    pageType: "serieObsConSim" | "meteorological"
    type: string
    seriesIdObs : number
    nombre_estacion : string
    title? : string
    icon?: string
    iconWidth?: number
    iconHeight?: number
    itemIcon?: string
    itemIconTag?: any
    calId? : number
    seriesIdSim? : number
    timeStartDays? : number
    timeEndDays? : number
    mainQualifier? : string
    errorBandLow? : string
    errorBandHigh? : string
    refLines? : RefLines
    seriesAuxiliares?: SerieAuxiliar[]
};

export default DataPage;
