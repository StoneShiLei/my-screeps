import { BUILD_PRIORITY } from "settings"


export default class ConstructionController {

    static getNearSite(pos: RoomPosition): ConstructionSite | null  {
        const room = Game.rooms[pos.roomName]
        if (!room) return null

        const sites: ConstructionSite[] = room.find(FIND_MY_CONSTRUCTION_SITES)
        if (sites.length <= 0) return null

        const groupedSite = _.groupBy(sites, site => site.structureType)

        // 先查找优先建造的工地
        for (const type of BUILD_PRIORITY) {
            const matchedSite = groupedSite[type]
            if (!matchedSite) continue

            if (matchedSite.length === 1) return matchedSite[0]
            const result = pos.findClosestByPath(matchedSite)
            if(!result) return null
            return result
        }

        // 没有优先建造的工地，直接找最近的
        const result = pos.findClosestByPath(sites)
        if(!result) return null
        return result
    }

}
