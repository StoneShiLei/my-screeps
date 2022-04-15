

type AllHarvestMode = HarvestStartupMode | HarvestContainerMode | HarvestStructureMode
type HarvestStartupMode = "harvestStartupMode"
type HarvestContainerMode = "harvestContainerMode"
type HarvestStructureMode = "harvestStructureMode"

type HarversterActionStrategy = {
    [key in AllHarvestMode]: {
        prepare: (creep:Creep, source: Source) => boolean,
        source: (creep: Creep, source: Source) => boolean,
        target: (creep: Creep) => boolean,
    }
}
