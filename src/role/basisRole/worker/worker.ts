import BodyAutoConfig from "modules/bodyConfig/bodyConfig";
import EnergyUtil from "modules/energy/energyUtil";
import Utils from "utils/utils";


export default class WorkerConfig implements RoleConfig {

    getResource?(creep: Creep): boolean {
        return this.getEnergy(creep)
    }

    workWithTarget(creep: Creep): boolean {
        if(!creep.memory.data.workerData) return true
        const workRoom = creep.memory.data.workerData.workRoom
        const room = Game.rooms[workRoom]
        if (creep.store[RESOURCE_ENERGY] === 0) {
            creep.changeToGetEnergyStage()
            return true
        }

        // 有新墙就先刷新墙
        if (creep.memory.fillWallId){
            creep.steadyWall()
            return false
        }


        let repairTarget:AnyStructure | null = null
        if(creep.memory.repairStructureId) repairTarget = Game.getObjectById(creep.memory.repairStructureId)
        if(!repairTarget) {
            delete creep.memory.repairStructureId
            const repairTargets = room.find(FIND_STRUCTURES,{filter:(s) => s.hits < s.hitsMax  && s.structureType != STRUCTURE_RAMPART && s.structureType != STRUCTURE_WALL})
            if(repairTargets.length > 0){
                repairTarget = creep.pos.findClosestByRange(repairTargets)
                creep.memory.repairStructureId = repairTarget?.id
            }
        }


        if (repairTarget){
            if(repairTarget.hits >= repairTarget.hitsMax){
                delete creep.memory.repairStructureId
                return true
            }
            const result = creep.repair(repairTarget)
            if(result === ERR_NOT_IN_RANGE) creep.goTo(repairTarget.pos,{range:2})
            else if(result === ERR_NOT_ENOUGH_ENERGY) {
                creep.changeToGetEnergyStage()
                return true
            }
            else if(result != OK){
                creep.say(`repair ${result}`)
                Utils.log(`维修任务异常，repair 返回值: ${result}`)
            }
            else{}
            return false
        }
        // 没有就建其他工地，如果找不到工地了，就算任务完成
        else if(room.find(FIND_CONSTRUCTION_SITES).length > 0){
            if (creep.buildStructure() === ERR_NOT_FOUND) {
                creep.changeToGetEnergyStage()
                return true
            }
        }
        else {
            const result = creep.upgradeRoom(workRoom)
            if(result === ERR_NOT_ENOUGH_RESOURCES){
                creep.changeToGetEnergyStage()
                return true
            }
            if(result !== ERR_NOT_IN_RANGE && result !== OK){
                creep.say("upgrade" + result)
                Utils.log(`升级任务异常，upgradeRoom 返回值: ${result}`)
            }
            return false
        }
        return false
    }
    body(room: Room, spawn: StructureSpawn, data: CreepData): BodyPartConstant[] {
        return BodyAutoConfig.createBodyGetter(BodyAutoConfig.bodyConfigs.worker)(room,spawn)
    }

    private getEnergy(creep:Creep):boolean{
        if(creep.store[RESOURCE_ENERGY] > 40) return true

        let resource:AllEnergySource | null = null
        //查找缓存是否存在
        if(creep.memory.sourceId){
            resource = Game.getObjectById(creep.memory.sourceId)
            //缓存失效则清除
            if(!resource) delete creep.memory.sourceId
        }

        //如果source不存在  则重新查找并缓存
        if(!resource){
            resource = EnergyUtil.getRoomEnergyTarget(creep.room,EnergyUtil.getClosestTo(creep.pos))
            if(resource) creep.memory.sourceId = resource.id
        }

        if(!resource || ((resource instanceof Structure || resource instanceof Tombstone || resource instanceof Ruin) && resource.store[RESOURCE_ENERGY] <= 0)
        || (resource instanceof Resource && resource.amount <= 0)){
            let target = resource? resource : creep.room.find(FIND_SOURCES)[0]
            //先移动到目标附近
            if(target) creep.goTo(target.pos,{range:3})
            else creep.say('no energy!')

            delete creep.memory.sourceId
            return false
        }

        //获取能量
        const result = creep.getEngryFrom(resource)
        return result == OK
    }
}
