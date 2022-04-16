import BodyAutoConfig from "modules/bodyConfig/bodyConfig";
import EnergyUtil from "modules/energy/energyUtil";
import Utils from "utils/utils";


export default class WorkerConfig implements RoleConfig {

    getResource?(creep: Creep): boolean {
        if(creep.store[RESOURCE_ENERGY] >= 20)return true

        let source = creep.pos.findClosestByRange(FIND_SOURCES)
        if (!source || source.getContainer()) {
            if (!source) creep.say('no source')
            return false
        }

        if(source.getContainer()){
            const newSources = creep.room.find(FIND_SOURCES,{filter:(source) => !source.getContainer()})
            if(newSources.length === 0) return false
            source = creep.pos.findClosestByRange(newSources)
            if(!source) return false
        }

        // 建造初始 container 时一无所有，所以只会捡地上的能量来用
        const droppedEnergy = source.getDroppedInfo().energy
        if (!droppedEnergy || droppedEnergy.amount < 100) {
            if(Game.time % 100) creep.say('wait energy')
            // 等待时先移动到附近
            creep.goTo(source.pos, { range: 4 })
            return false
        }

        creep.goTo(droppedEnergy.pos, { range: 1 })
        creep.pickup(droppedEnergy)
        return true
    }

    workWithTarget(creep: Creep): boolean {
        if (creep.store[RESOURCE_ENERGY] === 0) return true

        let containerSite:ConstructionSite | null = null

        const source = creep.pos.findClosestByRange(FIND_SOURCES)
        if (!source || source.getContainer()) {
            if (!source) creep.say('no source')
            return false
        }

        // 这里找的范围只要在 creep 的建造范围之内就行
        const containerSites = source?.pos.findInRange(FIND_CONSTRUCTION_SITES,2,
            {filter:site => site && site.structureType === STRUCTURE_CONTAINER})

        //找不到说明任务已经完成
        if(!containerSites || containerSites.length <= 0){
            return true
        }
        else{
            //如果存在工地  将id缓存到任务中
            containerSite = containerSites[0]
            const result = creep.build(containerSite)
            if(result === ERR_NOT_IN_RANGE) creep.goTo(containerSite.pos,{range:3})
            return false
        }
    }
    body(room: Room, spawn: StructureSpawn, data: CreepData): BodyPartConstant[] {
        return BodyAutoConfig.createBodyGetter(BodyAutoConfig.bodyConfigs.worker)(room,spawn)
    }
}
