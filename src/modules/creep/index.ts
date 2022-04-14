import Utils from "utils/utils"
import CreepExtension from "./creep"


export const mountCreep = function() {
    Utils.assignPrototype(Creep,CreepExtension)
}
