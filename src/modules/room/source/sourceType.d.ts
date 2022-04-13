

interface Source{
    /**
     * 该 source 是否可以采集
     * 会检查自己还有没有能量，且周围有没有剩余开采位
     */
    canUse(): boolean
    /**
     * 设置能量丢弃位置
     */
    setDroppedPos(pos: RoomPosition): void
    /**
     * 获取该 source 丢弃位置及其上的能量
     */
    getDroppedInfo():DroppedInfo
    /**
     * 绑定 container 到该 source
     */
    setContainer(container: StructureContainer): void
    /**
     * 获取该 source 上绑定的 container
     */
    getContainer(): StructureContainer | null
    /**
     * 绑定 link 到该 source
     */
    setLink(link: StructureLink): void
    /**
     * 获取该 source 上绑定的 link
     */
    getLink(): StructureLink | null
}

interface RoomMemory{
    /**
     * source 相关
     */
    source?: {
        [sourceId: string]: {
            /**
             * 能量丢弃到的位置
             * x 在前，y 在后，形如 23,32
             */
            dropped?: string
            /**
             * 该 source 配套的 container id
             */
            containerId?: Id<StructureContainer>
            /**
             * 该 source 配套的 link id
             */
            LinkId?: Id<StructureLink>
        }
    }
}


type DroppedInfo = {
    pos?:RoomPosition,
    energy?:Resource<RESOURCE_ENERGY>
}
type GoToDropPosResult = {
    // 本次移动的返回值
    result: ScreepsReturnCode
    // 移动的目的地（之前没有丢弃位置的话目标就为 source，否则为对应的能量丢弃位置）
    targetPos: RoomPosition
    // 要移动到的范围
    range: number
}
