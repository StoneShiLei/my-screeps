import Utils from "utils/utils";
import RoomPositionExtension from "./roomPosition";


export default function mountRoomPosition() {
    Utils.assignPrototype(RoomPosition,RoomPositionExtension)
}
