import RefLines from './ref_lines'
import SerieAuxiliar from './serieAuxiliar'

interface VientoParams {
    title?: string
    image?: string
    estacionId: number
    seriesIdWindVel: number
    seriesIdWindDir: number
    timeendDays?: number
}

type DataPage = {
    id: string
    pageType: "serieObsConSim"
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
    viento?: VientoParams
};

export default DataPage;
