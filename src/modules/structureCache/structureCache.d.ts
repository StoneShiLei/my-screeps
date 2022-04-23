interface Room {
    [x: string]: any
    mass_stores:MassStore[]
    my:boolean
    level:number
    update():void
    get<T extends CacheReturnType>(key:GetKey):T
}

type MassStore = StructureContainer | StructureStorage | StructureTerminal | StructureFactory


type CacheReturnType = ConstructionSite | BuildableStructureConstant |
AnyStructure | AnyStructure[] | Source | Deposit | undefined |
ConstructionSite[] | ConstructionSite


type GetKey = STRUCTURE_SPAWN| STRUCTURE_EXTENSION| STRUCTURE_ROAD| STRUCTURE_WALL|
STRUCTURE_RAMPART| STRUCTURE_KEEPER_LAIR| STRUCTURE_PORTAL| STRUCTURE_LINK|
STRUCTURE_TOWER| STRUCTURE_LAB| STRUCTURE_CONTAINER| STRUCTURE_POWER_BANK|
STRUCTURE_OBSERVER| STRUCTURE_POWER_SPAWN| STRUCTURE_EXTRACTOR| STRUCTURE_NUKER|
STRUCTURE_FACTORY| STRUCTURE_INVADER_CORE| LOOK_MINERALS|LOOK_SOURCES| LOOK_DEPOSITS|
 LOOK_CONSTRUCTION_SITES |STRUCTURE_STORAGE|STRUCTURE_TERMINAL
