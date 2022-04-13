

interface RoomPosition{

    /**
     * 获取该位置周围的开采位空位
     */
    getFreeSpace(): RoomPosition[]
    /**
     * 获取当前位置目标方向的 pos 对象
     * @param direction
     */
    directionToPos(direction: DirectionConstant): RoomPosition | undefined
}
