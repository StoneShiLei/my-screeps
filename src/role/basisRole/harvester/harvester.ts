import BodyAutoConfig from "modules/bodyConfig/bodyConfig";


export default class HarvesterConfig implements RoleConfig {

    getReady?(creep: Creep): boolean {

        const source = this.getSource(creep)
        if(!source) return false

        const harvestRoom = creep.memory.data.harvesterData?.harvestRoom;
        if(harvestRoom && harvestRoom !== creep.room.name){
            creep.goTo(new RoomPosition(25,25,harvestRoom))
            return false
        }

        this.setHarvestMode(creep,source)
        if(!creep.memory.data.harvesterData?.harvestMode){
            creep.say("My harvestMode is null")
            return false
        }

        const result = this.actionStrategy[creep.memory.data.harvesterData.harvestMode].prepare(creep,source)
        if(result) creep.posLock()  //设置拒绝对穿
        return result
    }

    getResource?(creep: Creep): boolean {
        const source = this.getSource(creep)
        if(!source) return false

        if(!creep.memory.data.harvesterData?.harvestMode){
            creep.say("My harvestMode is null")
            return false
        }
        return this.actionStrategy[creep.memory.data.harvesterData.harvestMode].source(creep, source)
    }

    workWithTarget(creep: Creep): boolean {
        if(!creep.memory.data.harvesterData?.harvestMode){
            creep.say("My harvestMode is null")
            return false
        }
        return this.actionStrategy[creep.memory.data.harvesterData.harvestMode].target(creep)
    }
    body(room: Room, spawn: StructureSpawn, data: CreepData): BodyPartConstant[] {
        if(!data.harvesterData) throw new Error("harvesterData不存在，无法生成Body")
        const souce = Game.getObjectById(data.harvesterData?.sourceID)
        const bodyConfig = !souce || !souce.getLink() ?
            BodyAutoConfig.bodyConfigs.harvester : BodyAutoConfig.bodyConfigs.worker;

        return BodyAutoConfig.createBodyGetter(bodyConfig)(room,spawn)
    }


    private actionStrategy:HarversterActionStrategy = {
        /**
         * 启动模式
         *
         * 当房间内没有搬运工时，采集能量，填充 spawn 跟 extension
         * 当有搬运工时，无脑采集能量
         */
        harvestStartupMode:{
            prepare: (creep, source) => {

                if(!creep.memory.data.harvesterData) {
                    creep.say("My data is null")
                    return false
                }

                const dropPosResult = this.goToDropPos(creep, source)
                if(!dropPosResult){
                    creep.say("My dropPosResult is null")
                    return false
                }

                const { targetPos, range } = dropPosResult

                // 没有抵达位置就准备未完成
                if (!creep.pos.inRangeTo(targetPos, range)) return false

                // 启动模式下，走到之后就将其设置为能量丢弃点
                source.setDroppedPos(creep.pos)

                // 把该位置存缓存到自己内存
                const { roomName, x, y } = creep.pos
                creep.memory.data.harvesterData.droppedPos = `${roomName},${x},${y}`

                // 如果脚下没有 container 及工地的话就放工地
                const posContinaer = creep.pos.lookFor(LOOK_STRUCTURES).filter(s => s.structureType === STRUCTURE_CONTAINER)
                const posContinaerSite = creep.pos.lookFor(LOOK_CONSTRUCTION_SITES).filter(s => s.structureType === STRUCTURE_CONTAINER)

                if (posContinaer.length <= 0 && posContinaerSite.length <= 0) {
                    creep.pos.createConstructionSite(STRUCTURE_CONTAINER)
                }
                return true
            },
            // 挖能量
            source: (creep, source) => {
                if(!creep.memory.data.harvesterData) {
                    creep.say("My data is null")
                    return false
                }

                const workRoom = Game.rooms[creep.memory.data.harvesterData.workRoom]
                if (!workRoom) return false

                // 如果有搬运工了就无脑采集
                if ((workRoom.transporterNum ?? 0) <= 0 && creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) return true

                creep.harvest(source)
                this.goToDropPos(creep, source)
                return false
            },
            // 把能量运到 spawn
            target: (creep) => {
                if(!creep.memory.data.harvesterData) {
                    creep.say("My data is null")
                    return false
                }

                const workRoom = Game.rooms[creep.memory.data.harvesterData.workRoom]
                if (!workRoom) return false

                // 有运输工了就回去挖能量
                if (creep.store[RESOURCE_ENERGY] <= 0 || (workRoom.transporterNum ?? 0) > 0) return true

                // 找到 spawn 然后把身上的能量全塞进去，不搜索 extension，因为启动时还没有 extension
                // 就算是重建，只要保证 spawn 里有能量也能孵化搬运工了
                // 如果没有spwan  就升级controller
                let target:(StructureSpawn | StructureController)[] = workRoom.find<StructureSpawn>(FIND_STRUCTURES,{filter:s => (s.structureType === STRUCTURE_SPAWN &&
                    s.store[RESOURCE_ENERGY] < SPAWN_ENERGY_CAPACITY)})
                if(target.length == 0){
                    target = workRoom.find<StructureController>(FIND_STRUCTURES,{filter:s => s.structureType === STRUCTURE_CONTROLLER && s.my })
                }

                creep.transferTo(target[0], RESOURCE_ENERGY)
                return false
            }
        },
        /**
         * 简单模式
         *
         * 在 container 不存在时切换为启动模式
         * 往 container 移动 > 检查 container 状态 > 无脑采集
         */
        harvestContainerMode:{
            prepare: (creep, source) => {
                if(!creep.memory.data.harvesterData) {
                    creep.say("My data is null")
                    return false
                }

                const container = source.getContainer()
                if (!container) {
                    creep.memory.data.harvesterData.harvestMode = "harvestStartupMode"
                    return false
                }

                //可能会出现container被link摧毁后重新放置的可能性  搜索link然后更改mode
                const link = source.getLink()
                if(link){
                    creep.memory.data.harvesterData.harvestMode = "harvestStructureMode"
                    return false
                }

                creep.goTo(container.pos)
                // 没抵达位置就还没准备完成
                if (!creep.pos.inRangeTo(container, 0)) return false

                // container 掉血了就发布维修任务
                if (container.hits < container.hitsMax) {
                    const workRoom = Game.rooms[creep.memory.data.harvesterData.workRoom]
                    if (!workRoom) return false
                    // 修个小 container，派一个人来修就可以了，所以不用指定高优先级
                    // workRoom.workController.updateTask(new RepairTask(), { dispath: true })
                }

                return true
            },
            /**
             * 采集阶段会无脑采集，过量的能量会掉在 container 上然后被接住存起来
             */
            source: (creep) => {
                if(!creep.memory.data.harvesterData) {
                    creep.say("My data is null")
                    return false
                }

                const sourceID = creep.memory.data.harvesterData.sourceID
                if(!sourceID) return false
                const source = Game.getObjectById(sourceID)
                if(!source){
                    creep.say("source is not found")
                    return false
                }
                creep.getEngryFrom(source)

                // 如果房间里有 storage，则定期发布 container 到 storage 的能量转移任务
                if (creep.room.storage && !(Game.time % 100)) {
                    const container = source.getContainer()
                    // 能量达到数量了就发布任务，这个值应该低一点
                    // 不然有可能出现 worker 吃能量比较快导致任务发布数量太少
                    if (container && container.store[RESOURCE_ENERGY] > 200) {
                        // // 看看是不是已经有发布好的任务了
                        // const hasTransportTask = creep.room.transportController.tasks.find((task) => {
                        //     return task.taskType === 'transportTask' && (task as TransportTask).from === container.id
                        // })

                        // // 没有任务的话才会发布
                        // !hasTransportTask && creep.room.transportController.addTask(new TransportTask(
                        //     container.id,creep.room.storage.id,RESOURCE_ENERGY,100
                        // ))
                    }
                }

                // 快死了就把身上的能量丢出去，这样就会存到下面的 container 里，否则变成墓碑后能量无法被 container 自动回收
                if (creep.ticksToLive && creep.ticksToLive < 2) creep.drop(RESOURCE_ENERGY)
                return false
            },
            /**
             * 简单模式没有 target 阶段
             */
            target: () => true
        },
        /**
         * 转移模式
         *
         * 在 link 不存在时切换为启动模式
         * 采集能量 > 存放到指定建筑
         */
        harvestStructureMode:{
            prepare: (creep, source) => {
                if(!creep.memory.data.harvesterData) {
                    creep.say("My data is null")
                    return false
                }

                const link = Game.getObjectById(creep.memory.data.harvesterData.targetID as Id<StructureLink>)

                // 目标没了，变更为启动模式
                if (!link) {
                    delete creep.memory.data.harvesterData.targetID
                    creep.memory.data.harvesterData.harvestMode = "harvestStartupMode"
                    return false
                }

                const { x: sourceX, y: sourceY } = source.pos
                const { x: linkX, y: linkY } = link.pos

                // 移动到 link 和 source 相交的位置，这样不用移动就可以传递能量
                const targetPos = new RoomPosition(Math.max(sourceX, linkX) - 1, Math.max(sourceY, linkY) - 1, source.room.name)
                creep.goTo(targetPos)
                return creep.pos.isEqualTo(targetPos)
            },
            source: (creep, source) => {
                if (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) return true
                // 快死了就把能量移出去
                if (creep.ticksToLive && creep.ticksToLive < 2) return true

                creep.getEngryFrom(source)

                return false
            },
            target: (creep) => {
                if(!creep.memory.data.harvesterData) {
                    creep.say("My data is null")
                    return false
                }

                const target = Game.getObjectById(creep.memory.data.harvesterData.targetID as Id<StructureLink>)

                // 目标没了，变更为启动模式
                if (!target) {
                    delete creep.memory.data.harvesterData.targetID
                    creep.memory.data.harvesterData.harvestMode = "harvestStartupMode"
                    return true
                }

                creep.transferTo(target, RESOURCE_ENERGY)
                return true
            }
        }
    }

    private setHarvestMode(creep:Creep,source:Source):void{
        if(!creep.memory.data.harvesterData) return

        //外矿
        if(!source.room.controller || source.room.controller.level <= 0){
            creep.memory.data.harvesterData.harvestMode = "harvestStartupMode"
            return
        }

        //link
        const nearLink = source.getLink()
        if(nearLink){
            creep.memory.data.harvesterData.harvestMode = "harvestStructureMode"
            creep.memory.data.harvesterData.targetID = nearLink.id
            return
        }

        //container
        const nearContainer = source.getContainer()
        if(nearContainer){
            creep.memory.data.harvesterData.harvestMode = "harvestContainerMode"
            creep.memory.data.harvesterData.targetID = nearContainer.id
            return
        }
        //默认启动模式
        creep.memory.data.harvesterData.harvestMode = "harvestStartupMode"
    }

    /**
     * 移动到 source 旁丢弃能量的位置
     * @param creep 执行移动的单位
     */
    private goToDropPos(creep:Creep, source: Source): GoToDropPosResult | null {
        let targetPos: RoomPosition
        let range = 0

        if(!creep.memory.data.harvesterData) {
            creep.say("My data is null")
            return null
        }

        // 尝试从缓存里读位置
        const droppedPos = creep.memory.data.harvesterData.droppedPos
        if (droppedPos) {
            const [ roomName, x, y ] = droppedPos.split(',')
            targetPos = new RoomPosition(Number(x), Number(y), roomName)
        }
        else {
            const { pos: droppedPos } = source.getDroppedInfo()
            // 之前就已经有点位了，自己保存一份
            if (droppedPos) {
                const { roomName, x, y } = droppedPos
                creep.memory.data.harvesterData.droppedPos = `${roomName},${x},${y}`
            }
            // 没有点位的话就要移动到 source，调整移动范围
            else range = 1

            targetPos = droppedPos ? droppedPos : source.pos
        }

        // 到了就不进行移动了
        if (creep.pos.isEqualTo(targetPos)) return { result: OK, targetPos, range }

        // 执行移动
        const result = creep.goTo(targetPos,{range:range})
        return { result, targetPos, range }
    }

    private getSource(creep:Creep):(Source | null){
        if(!creep.memory.data.harvesterData) {
            creep.say("My data is null")
            return null
        }

        const {sourceID} = creep.memory.data.harvesterData
        if(!sourceID) {
            creep.say("My sourceId is null")
            return null
        }

        const source = Game.getObjectById(sourceID)
        if(!source){
            creep.say("My source is null")
            return null
        }

        return source
    }
}
