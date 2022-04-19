/**
 * 房间位置拓展
 */
 export default class RoomPositionExtension extends RoomPosition {

    /**
     * 获取该位置周围的开采位空位
     */
    public getFreeSpace(): RoomPosition[] {
        const terrain = new Room.Terrain(this.roomName)
        const result: RoomPosition[] = []

        const xs = [this.x - 1, this.x, this.x + 1]
        const ys = [this.y - 1, this.y, this.y + 1]

        // 遍历 x 和 y 坐标
        xs.forEach(x => ys.forEach(y => {
            // 如果不是墙则 ++
            if (terrain.get(x, y) != TERRAIN_MASK_WALL) result.push(new RoomPosition(x, y, this.roomName))
        }))

        return result
    }
}
