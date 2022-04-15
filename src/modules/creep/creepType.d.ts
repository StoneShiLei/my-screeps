
interface Creep{
    goTo(target:RoomPosition,opt?:GoToOpt):ScreepsReturnCode

    getEngryFrom(target: AllEnergySource): ScreepsReturnCode
    transferTo(target:  AnyCreep | Structure, RESOURCE: ResourceConstant, moveOpt?: MoveToOpts): ScreepsReturnCode

    upgradeRoom(roomName: string): ScreepsReturnCode
    buildStructure(targetConstruction?: ConstructionSite): CreepActionReturnCode | ERR_NOT_ENOUGH_RESOURCES | ERR_RCL_NOT_ENOUGH | ERR_NOT_FOUND | ERR_RCL_NOT_ENOUGH

    changeToGetEnergyStage():void
    posLock():void
    posUnlock():void

    steadyWall(): OK | ERR_NOT_FOUND
    fillDefenseStructure():boolean
}

interface CreepMemory {
    sourceId?: Id<AllEnergySource>
    targetId?: Id<Source | StructureWithStore | ConstructionSite>

    repairStructureId?: Id<AnyStructure>

    constructionSiteInfo?:{
        id?: Id<ConstructionSite>
        type?: StructureConstant
        pos?: RoomPosition
    }

    fillWallId?: Id<StructureWall | StructureRampart>
    fillStructureId?: Id<StructureWithStore>

    dontPullMe?:boolean

    spawnRoom: string;
    cantRespawn?: boolean


}

interface GoToOpt{
    range:number
}
