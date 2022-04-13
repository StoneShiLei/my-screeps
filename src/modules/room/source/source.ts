
export default class SourceExtension extends Source {

    /**
     * 获取source是否可以采集
     * @returns
     */
    public canUse():boolean{
        if(this.energy <= 0) return false

        const freePosCount = this.pos.getFreeSpace().length
        const harvestCount = this.pos.findInRange(FIND_CREEPS,1).length
        return freePosCount - harvestCount > 0
    }

    /**
     * 设置能量丢弃位置
     *
     * @param pos 能量会被丢弃到的位置上
     */
    public setDroppedPos(pos:RoomPosition):void{
        this.keepKeyExist()
        if(!this.room.memory.source) return
        this.room.memory.source[this.id].dropped = `${pos.x},${pos.y}`
    }

    /**
     * 获取该 source 的丢弃位置信息
     * @returns
     */
    public getDroppedInfo():DroppedInfo{
        this.keepKeyExist()
        if(!this.room.memory.source) return {}

        const { dropped } = this.room.memory.source[this.id]
        if(!dropped) return {}

        // 获取能量丢弃位置
        const [x,y] = dropped.split(',')
        const droppedPos = new RoomPosition(Number(x),Number(y),this.room.name)
        if(!droppedPos){
            delete this.room.memory.source[this.id].dropped
            return {}
        }

        // 获取该位置上的能量
        const energy = droppedPos.lookFor(LOOK_RESOURCES).find(res =>{
            return res.resourceType === RESOURCE_ENERGY
        }) as Resource<RESOURCE_ENERGY>

        return {pos:droppedPos,energy}
    }

    /**
     * 绑定 container 到该 source
     */
    public setContainer(container:StructureContainer):void{
        this.keepKeyExist()
        if(!this.room.memory.source) return

        this.room.memory.source[this.id].containerId = container.id
    }

    /**
     * 获取该 source 上绑定的 container
     * 注意，由于 container 没有视野，所以外矿 container 存在但房间没视野时可能也会返回 null
     */
    public getContainer():StructureContainer | null{
        this.keepKeyExist()
        if(!this.room.memory.source) return null

        const { containerId } = this.room.memory.source[this.id]
        if(!containerId) return null

        const container = Game.getObjectById<StructureContainer>(containerId)
        if(!container){
            delete this.room.memory.source[this.id].containerId
            return null
        }

        return container
    }

    /**
     * 绑定 link 到该 source
     */
    public setLink(link: StructureLink): void {
        this.keepKeyExist()
        if(!this.room.memory.source) return

        this.room.memory.source[this.id].LinkId = link.id
    }

    /**
     * 获取该 source 上绑定的 link
     */
    public getLink(): StructureLink | null {
        this.keepKeyExist()
        if(!this.room.memory.source) return null

        const { LinkId } = this.room.memory.source[this.id]
        if (!LinkId) return null

        const link = Game.getObjectById<StructureLink>(LinkId)
        if (!link) {
            delete this.room.memory.source[this.id].LinkId
            return null
        }

        return link
    }

    /**
     * 保证所需的内存字段一定存在
     */
    private keepKeyExist(): void {
        if (!this.room.memory.source) this.room.memory.source = {}
        if (!this.room.memory.source[this.id]) this.room.memory.source[this.id] = {}
    }
}
