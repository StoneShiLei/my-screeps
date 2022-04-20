import Utils from "utils/utils"
import { RoomCacheProxy } from "./cacheProxy"

export function structureCache(){
    require('structureCache')
    Utils.assignPrototype(Room,RoomCacheProxy)
}
