import Utils from "utils/utils"
import RoomExtension from "./room"
import SourceExtension from "./source/source"



export const mountRoom = function() {
    Utils.assignPrototype(Room,RoomExtension)
    Utils.assignPrototype(Source,SourceExtension)
}
