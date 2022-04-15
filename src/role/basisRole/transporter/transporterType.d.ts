
type AllTransportAction = FillExtensionAction | FillTowerAction | TransportAction
type FillExtensionAction = "fillExtensionAction"
type FillTowerAction = "fillTowerAction"
type TransportAction = "transportAction"
type TransporterActionStrategy = {
    [key in AllTransportAction]: {
        source: (creep: Creep) => boolean,
        target: (creep: Creep) => boolean,
    }
}
