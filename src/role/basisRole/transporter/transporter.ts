import BodyAutoConfig from "modules/bodyConfig/bodyConfig";
import EnergyUtil from "modules/energy/energyUtil";
import { TRANSFER_DEATH_LIMIT } from "settings";
import Utils from "utils/utils";

export default class TransporterConfig implements RoleConfig {

    getResource?(creep: Creep): boolean {
        if(!creep.memory.data.transporterData){
            creep.say("My data is null")
            return false
        }

        const { sourceID } = creep.memory.data.transporterData
        if(creep.ticksToLive && creep.ticksToLive <= TRANSFER_DEATH_LIMIT) return this.deathPrepare(creep,sourceID)

        //如果extension和spawn不满
        const extensions = creep.room.find<StructureExtension>(FIND_STRUCTURES,
            {filter:s => s && s.structureType === STRUCTURE_EXTENSION && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0})
        const spawns = creep.room.find<StructureSpawn>(FIND_STRUCTURES,
            {filter:s => s && s.structureType === STRUCTURE_SPAWN && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0})
        const spawnStructures = [...extensions,...spawns]
        if(spawnStructures.length > 0){
            creep.memory.data.transporterData.onWorkType = 'fillExtensionAction'
            return this.actionStrategy['fillExtensionAction'].source(creep)
        }

        //如果塔不满900
        const towers = creep.room.find<StructureTower>(FIND_STRUCTURES,{
            filter:s => s.structureType === STRUCTURE_TOWER &&
            s.store[RESOURCE_ENERGY] <= 900
        })
        if(towers.length <= 0){
            creep.memory.data.transporterData.onWorkType = 'fillTowerAction'
            return this.actionStrategy['fillTowerAction'].source(creep)
        }

        //如果有storage  定期从container拿到storage
        if(creep.room.storage && !(Game.time % 100))
        {
            const containers = creep.room.find<StructureContainer>(FIND_STRUCTURES,{
                filter:s => s.structureType === STRUCTURE_CONTAINER &&
                s.store[RESOURCE_ENERGY] > 200
            })
            if(containers.length > 0){
                creep.memory.data.transporterData.endCondition = 100
                creep.memory.data.transporterData.resourceType = RESOURCE_ENERGY
                creep.memory.data.transporterData.from = containers[0].id
                creep.memory.data.transporterData.to = creep.room.storage.id

                creep.memory.data.transporterData.onWorkType = 'transportAction'
                return this.actionStrategy['transportAction'].source(creep)
            }
        }

        return false
    }

    workWithTarget(creep: Creep): boolean {
        if(!creep.memory.data.transporterData){
            creep.say("My data is null")
            return false
        }

        if(!creep.memory.data.transporterData.onWorkType){
            return true
        }

        const result = this.actionStrategy[creep.memory.data.transporterData.onWorkType].target(creep)
        if(result) {
            delete creep.memory.data.transporterData.onWorkType
            return result
        }

        return false
    }

    body(room: Room, spawn: StructureSpawn, data: CreepData): BodyPartConstant[] {
        return BodyAutoConfig.createBodyGetter(BodyAutoConfig.bodyConfigs.transporter)(room,spawn)
    }

    private actionStrategy: TransporterActionStrategy = {
        fillExtensionAction: {
            source: (creep: Creep):boolean => {
                return this.getEnergy(creep)
            },
            target:(creep: Creep):boolean => {
                if(creep.store[RESOURCE_ENERGY] === 0){
                    creep.changeToGetEnergyStage()
                    return true
                }
                const result = this.fillSpawnStructure(creep)
                if(result === ERR_NOT_FOUND || result == ERR_NOT_ENOUGH_ENERGY){
                    creep.changeToGetEnergyStage()
                    return true
                }

                return false
            }
        },
        fillTowerAction:{
            source: (creep: Creep):boolean => {
                return this.getEnergy(creep)
            },
            target:(creep: Creep):boolean => {
                if(creep.store[RESOURCE_ENERGY] === 0){
                    creep.changeToGetEnergyStage()
                    return true
                }

                let target:StructureTower | null = null

                if(creep.memory.fillStructureId){
                    target = Game.getObjectById(creep.memory.fillStructureId as Id<StructureTower>)

                    //能量大于900就移除缓存
                    if(!target || target.structureType!== STRUCTURE_TOWER || target.store[RESOURCE_ENERGY] > 900){
                        delete creep.memory.fillStructureId
                        target = null
                    }
                }

                //缓存失效
                if(!target){
                    const towers = creep.room.find<StructureTower>(FIND_STRUCTURES,{
                        filter:s => s.structureType === STRUCTURE_TOWER &&
                        s.store[RESOURCE_ENERGY] <= 900
                    })

                    if(towers.length <= 0){
                        creep.changeToGetEnergyStage()
                        return true
                    }

                    target = creep.pos.findClosestByRange(towers)
                    creep.memory.fillStructureId = target?.id
                }

                if(!target){
                    creep.changeToGetEnergyStage()
                    return true
                }

                const result = creep.transfer(target,RESOURCE_ENERGY)
                if(result != OK && result != ERR_NOT_IN_RANGE){
                    creep.say(`fillTower ${result}`)
                    Utils.log(`填塔任务异常，transferTo 返回值: ${result}`)
                }

                return false;
            }
        },
        transportAction: {
            source: (creep: Creep):boolean => {
                const from = creep.memory.data.transporterData?.from
                const resourceType = creep.memory.data.transporterData?.resourceType
                const endCondition = creep.memory.data.transporterData?.endCondition

                if(!from || !resourceType || !endCondition){
                    return false
                }

                if(creep.store[resourceType] > 0) return true

                if(!creep.memory.data.transporterData?.from){
                    creep.say('no from')
                    return false
                }

                if(typeof from === 'string'){
                    const target = Game.getObjectById(from)
                    if(!target) return false

                    const resAmount = target.store[resourceType] || 0
                    if(resAmount <= (endCondition || 0)) return false

                    creep.goTo(target.pos,{range:1})
                    const result = creep.withdraw(target,resourceType)
                    return result == OK
                }
                else{
                    const [x,y,roomName] = from as [number,number,string]
                    const targetPos = new RoomPosition(x,y,roomName)

                    const targetRes = targetPos.lookFor(LOOK_RESOURCES).find(r => r.resourceType === resourceType)

                    if(!targetRes || targetRes.amount <= (endCondition || 0)) return false

                    creep.goTo(targetPos,{range:1})
                    const result = creep.pickup(targetRes)
                    return result == OK
                }

            },
            target:(creep: Creep):boolean => {
                const to = creep.memory.data.transporterData?.to
                const resourceType = creep.memory.data.transporterData?.resourceType

                if(!to || !resourceType){
                    return false
                }

                if(typeof to === 'string'){
                    const target = Game.getObjectById(to)
                    if(!target) return false

                    creep.goTo(target.pos,{range:1})
                    const result = creep.transfer(target,resourceType)
                    return result == OK
                }
                else{
                    const [x,y,roomName] = to as [number,number,string]
                    const targetPos = new RoomPosition(x,y,roomName)

                    creep.goTo(targetPos,{range:1})
                    const result = creep.drop(resourceType)
                    return result == OK
                }
            }
        },
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

    private fillSpawnStructure(creep:Creep):OK | ERR_NOT_FOUND | ERR_NOT_ENOUGH_ENERGY{
        if(creep.store[RESOURCE_ENERGY] === 0) return ERR_NOT_ENOUGH_ENERGY
        let target:StructureExtension | StructureSpawn | null = null

        //使用缓存
        if(creep.memory.fillStructureId){
            target = Game.getObjectById(creep.memory.fillStructureId as Id<StructureExtension>)

            //如果找不到对应的建筑或者建筑已被填满就移除缓存
            if(!target || target.structureType !== STRUCTURE_EXTENSION || target.store.getFreeCapacity(RESOURCE_ENERGY) <= 0){
                delete creep.memory.fillStructureId
                target = null
            }
        }

        //没有缓存则重新获取
        if(!target){
            const extensions = creep.room.find<StructureExtension>(FIND_STRUCTURES,
                {filter:s => s && s.structureType === STRUCTURE_EXTENSION && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0})
            const spawns = creep.room.find<StructureSpawn>(FIND_STRUCTURES,
                {filter:s => s && s.structureType === STRUCTURE_SPAWN && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0})
            const needFillStructure = [...extensions,...spawns]
            target = creep.pos.findClosestByRange(needFillStructure)

            if(!target) return ERR_NOT_FOUND

            //写入缓存
            creep.memory.fillStructureId = target.id
        }

        const result = creep.transferTo(target,RESOURCE_ENERGY)
        if(result === ERR_NOT_ENOUGH_RESOURCES) return ERR_NOT_ENOUGH_ENERGY
        if(result === ERR_FULL) delete creep.memory.fillStructureId
        if(result !== OK && result != ERR_NOT_IN_RANGE) {
            creep.say(`fillEx ${result}`)
            Utils.log(`填扩展任务异常，transferTo 返回值: ${result}`)
        }
        return OK
    }

    private deathPrepare(creep: Creep, sourceId?: Id<StructureWithStore>): false{
        if (creep.store.getUsedCapacity() > 0) {
            for (const resourceType in creep.store) {
                let target: StructureWithStore | null | undefined
                // 不是能量就放到 terminal 里
                if (resourceType != RESOURCE_ENERGY && resourceType != RESOURCE_POWER && creep.room.terminal) {
                    target = creep.room.terminal
                }
                // 否则就放到 storage 或者指定的地方
                else target = sourceId ? Game.getObjectById(sourceId): creep.room.storage
                // 刚开新房的时候可能会没有存放的目标
                if (!target) return false

                // 转移资源
                creep.goTo(target.pos)
                creep.transfer(target, <ResourceConstant>resourceType)

                return false
            }
        }
        else creep.suicide()

        return false
    }
}

