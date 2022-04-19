import { DEFAULT_OPTIONS } from "modules/framework/createApp";
import { AppLifecycleCallbacks } from "modules/framework/types";
import Utils from "utils/utils";
import { ArrayExtension } from "./array/array";
import { CreepExtension } from "./creep/creep";
import { RoomExtension } from "./room/room";
import { SpawnExtension } from "./spawn/spawn";



export default function():AppLifecycleCallbacks{
    Utils.assignPrototype(Array, ArrayExtension)
    Utils.assignPrototype(Creep,CreepExtension)
    Utils.assignPrototype(Room,RoomExtension)
    Utils.assignPrototype(StructureSpawn,SpawnExtension)

    return {
        born:()=>{
            Utils.log('初始化完成！', [DEFAULT_OPTIONS.name], false,'green')
        }
    }
}
