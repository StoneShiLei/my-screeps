import ConstructionController from "modules/constructionController/constructionController"
import { creepRoleConfigs } from "role"
import { MIN_WALL_HITS, REPAIR_SETTING } from "settings"
import SuperMove from "superMove"

export default class CreepExtension extends Creep {

    public onWork():void{
        if(!(this.memory.role in creepRoleConfigs)){
            this.say(`role ${this.memory.role} not found`)
            return
        }

        if(this.spawning) return

        // 获取对应配置项
        const roleConfig = creepRoleConfigs[this.memory.role]

        // 没准备的时候就执行准备阶段
        if(!this.memory.ready){
            if(roleConfig.getReady) this.memory.ready = roleConfig.getReady(this)
            else this.memory.ready = true
        }

        //　如果执行了 prepare 还没有 ready，就返回等下个 tick 再执行
        if(!this.memory.ready) return

        // 获取是否工作，没有 source 的话直接执行 target
        const working = roleConfig.getResource ? this.memory.working : true
        let stateChange = false;

        // 执行对应阶段
        // 阶段执行结果返回 true 就说明需要更换 working 状态
        if(working){
            stateChange = roleConfig.workWithTarget && roleConfig.workWithTarget(this)
        }
        else{
            stateChange = (roleConfig.getResource || false) && roleConfig.getResource(this)
        }

        if(stateChange) this.memory.working = !this.memory.working
    }

    public goTo(target:RoomPosition,opt:GoToOpt = {range:0}):ScreepsReturnCode{
        return this.moveTo(target,opt)
    }

    public getEngryFrom(target: AllEnergySource): ScreepsReturnCode {
        let result: ScreepsReturnCode
        // 是建筑 或者遗迹 就用 withdraw
        if (target instanceof Ruin || target instanceof Structure || target instanceof Tombstone) {
            // 如果建筑里没能量了就不去了，防止出现粘性
            if ((target instanceof Structure || target instanceof Ruin ) && target.store[RESOURCE_ENERGY] <= 0) return ERR_NOT_ENOUGH_ENERGY
            else if(target instanceof Ruin)result = this.withdraw(target as Ruin, RESOURCE_ENERGY)
            else if(target instanceof Tombstone)result = this.withdraw(target as Tombstone, RESOURCE_ENERGY)
            else if(target instanceof Structure)result = this.withdraw(target as Structure, RESOURCE_ENERGY)
            else return ERR_INVALID_TARGET
        }
        else if (target instanceof Resource) result = this.pickup(target as Resource)
        // 不是的话就用 harvest
        else result = this.harvest(target as Source)

        if (result === ERR_NOT_IN_RANGE) this.goTo(target.pos)

        return result
    }

    public transferTo(target: AnyCreep | Structure, RESOURCE: ResourceConstant, moveOpt: GoToOpt = {range:0}): ScreepsReturnCode {
        const result = this.transfer(target,RESOURCE)
        if(result === ERR_NOT_IN_RANGE) this.goTo(target.pos,moveOpt)
        return result
    }

    public changeToGetEnergyStage():void{
        delete this.memory.sourceId
    }

    public posLock():void{
        this.memory.dontPullMe = true
    }

    public posUnlock():void{
        delete this.memory.dontPullMe
    }

    public buildStructure(targetConstruction?:ConstructionSite):CreepActionReturnCode | ERR_NOT_ENOUGH_RESOURCES | ERR_NOT_FOUND | ERR_RCL_NOT_ENOUGH{
        const target = this.getBuildTarget(targetConstruction)

        if(!target) return ERR_NOT_FOUND

        // 上面发现有墙要刷了，这个 tick 就不再造建造了,防止出现造好一个 rampart，
        // 然后直接造下一个 rampart，造好后又扭头去刷第一个 rampart 的小问题出现
        if (this.memory.fillWallId) return ERR_BUSY

        const buildResult = this.build(target)

        if (buildResult == OK) {
            // 如果修好的是 rempart 的话就移除墙壁缓存 让维修单位可以快速发现新 rempart
            if (target.structureType == STRUCTURE_RAMPART) {
                delete this.room.memory.focusWall
            }
        }

        if(buildResult == ERR_NOT_IN_RANGE){
            this.goTo(target.pos)
        }
        return buildResult
    }

    /**
     * 建筑目标获取
     * 优先级：指定的目标 > 自己保存的目标 > 房间内保存的目标
     */
    private getBuildTarget(target?:ConstructionSite | null):ConstructionSite | null{
        if(!this.memory.constructionSiteInfo) this.memory.constructionSiteInfo = {}
        let constructInfo = this.memory.constructionSiteInfo

        // 已指定目标 更新缓存 并返回
        if(target){
            constructInfo.id = target.id
            constructInfo.pos = target.pos
            constructInfo.type = target.structureType
            this.room.memory.constructionSiteId = target.id
            return target
        }

        // 查找creep缓存目标
        if(constructInfo.id) target = Game.getObjectById(constructInfo.id)

        if(target) return target
        else {
            // target不存在  说明id已经失效  工地消失  检查该位置是否有造完的建筑物
            const structures = this.pos.lookFor(LOOK_STRUCTURES)
            if(structures.length > 0){
                //如果建筑物为墙 就记住该墙的id 稍后把血量刷高点
                const structure = structures[0]
                if(structure.structureType == STRUCTURE_RAMPART || structure.structureType == STRUCTURE_WALL){
                    this.memory.fillWallId = structure.id as Id<StructureWall | StructureRampart>
                }

                //完成建筑后 清空房间移动路径缓存 重建路径
                SuperMove.deletePathInRoom(this.room.name)
            }

            //清空储存的目标信息
            constructInfo = {}
        }

        // 查找room缓存目标
        if(this.room.memory.constructionSiteId) target = Game.getObjectById(this.room.memory.constructionSiteId)

        // 如果没有房间缓存目标  就重新搜索
        if(!target){
            delete this.room.memory.constructionSiteId
            target = ConstructionController.getNearSite(this.pos)
        }

        // 仍然不存在就真没有了
        if(!target) return null

        // 更新creep缓存
        constructInfo.id = target.id
        constructInfo.pos = target.pos
        constructInfo.type = target.structureType
        // 更新房间缓存
        this.room.memory.constructionSiteId = target.id

        return target
    }

     /**
     * 稳定新墙
     * 会把内存中 fillWallId 标注的墙声明值刷到定值以上
     */
    public steadyWall(): OK | ERR_NOT_FOUND {
        const wallID = this.memory.fillWallId
        if(!wallID){
            delete this.memory.fillWallId
            return ERR_NOT_FOUND
        }
        const wall = Game.getObjectById(wallID)
        if (!wall){
            delete this.memory.fillWallId
            return ERR_NOT_FOUND
        }

        if (wall.hits < MIN_WALL_HITS) {
            const result = this.repair(wall)
            if (result == ERR_NOT_IN_RANGE) this.goTo(wall.pos)
            else this.say(`steadyWall ${result}`)
        }
        else delete this.memory.fillWallId
        return OK
    }
    /**
     * 填充防御性建筑
     * 包括 wall 和 rempart
     * @returns 当没有墙需要刷时返回 false，否则返回 true
     */
    public fillDefenseStructure():boolean{
        const focusWall = this.room.memory.focusWall
        let targetWall: StructureWall | StructureRampart | null = null
        // 该属性不存在 或者 当前时间已经大于关注时间 就刷新
        if (!focusWall || (focusWall && Game.time >= focusWall.endTime)) {
            // 获取所有没填满的墙

            const walls =  this.room.find<StructureWall | StructureRampart>(FIND_STRUCTURES
                ,{filter:s => s && (s.structureType === STRUCTURE_WALL || s.structureType === STRUCTURE_RAMPART) && s.hits < s.hitsMax})

            // 没有目标就啥都不干
            if (walls.length <= 0) return false

            // 找到血量最小的墙
            targetWall = walls.sort((a, b) => a.hits - b.hits)[0]

            // 将其缓存在内存里
            this.room.memory.focusWall = {
                id: targetWall.id,
                endTime: Game.time + REPAIR_SETTING.focusTime
            }
        }

        // 获取墙壁
        if (!targetWall && focusWall) targetWall = Game.getObjectById(focusWall.id)
        // 如果缓存里的 id 找不到墙壁，就清除缓存下次再找
        if (!targetWall) {
            delete this.room.memory.focusWall
            // 这个时候返回 true，因为还不确定是否所有的墙都刷好了
            return true
        }

        // 填充墙壁
        const result = this.repair(targetWall)
        if (result == ERR_NOT_IN_RANGE) this.goTo(targetWall.pos)
        return true
    }
}
