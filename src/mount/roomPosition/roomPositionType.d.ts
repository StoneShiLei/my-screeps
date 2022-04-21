

interface RoomPosition{

    /**
     * 获取该位置周围的开采位空位
     */
    getFreeSpace(): RoomPosition[]

    nearPos(range:number): RoomPosition[]

    walkable(withCreep?:boolean): boolean
}
