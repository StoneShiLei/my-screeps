
 export default class RoomPositionExtension extends RoomPosition {

    nearPos(range:number = 1): RoomPosition[]{
        const array = [];
        for(let i=-range;i<=range;i++){
            for(let j=-range;j<=range;j++){
                if((i||j) && this.x+i>0 && this.y+j>0 && this.x+i<49 && this.y+j<49){
                    array.push(new RoomPosition(this.x+i,this.y+j,this.roomName))
                }
            }
        }
        return array
    }

    walkable(withCreep:boolean = false): boolean{
        if(!Game.rooms[this.roomName]) return new Room.Terrain(this.roomName).get(this.x,this.y) == TERRAIN_MASK_WALL

        const structure:boolean = this.lookFor(LOOK_STRUCTURES).every(s => {
            return !(s.structureType !== STRUCTURE_CONTAINER && s.structureType !== STRUCTURE_ROAD &&
            (s.structureType !== STRUCTURE_RAMPART || (s.structureType === STRUCTURE_RAMPART && (s as StructureRampart).my && (s as StructureRampart).isPublic)))
        }) && this.lookFor(LOOK_TERRAIN).every(t => t !== 'wall')

        if(!withCreep) return structure

        const creep = this.lookFor(LOOK_CREEPS).length === 0
        return structure && creep
    }

    /**
     * 获取该位置周围的开采位空位
     */
    getFreeSpace(): RoomPosition[] {
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
