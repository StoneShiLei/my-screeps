import Utils from "utils/utils"
import ControllerExtension from "./controller/controller"
import RoomExtension from "./room"
import SourceExtension from "./source/source"



export const mountRoom = function() {
    Utils.assignPrototype(Room,RoomExtension)
    Utils.assignPrototype(Source,SourceExtension)
    Utils.assignPrototype(StructureController,ControllerExtension)
}
