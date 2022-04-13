import Utils from "utils/utils"
import SpawnExtension from "./spawn"


export const mountSpawner = function() {
    Utils.assignPrototype(StructureSpawn,SpawnExtension)
}
