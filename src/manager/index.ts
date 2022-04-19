import { AppLifecycleCallbacks } from "modules/framework/types"
import { Container } from "typescript-ioc"
import { CreepManager } from "./creepManager/creepManager"
import { RoomManager } from "./roomManager/roomManager"



export function roomManagerCallbacks():AppLifecycleCallbacks{
    const manager = Container.get(RoomManager)
    return {
        tickStart:manager.tickStart,
        tickEnd:manager.tickEnd,
    }
}
export function roomRunner(): (room: Room) => void {
    const manager = Container.get(RoomManager)
    return manager.run
}


export function creepManagerCallbacks():AppLifecycleCallbacks{
    const manager = Container.get(CreepManager)
    return {
        tickStart:manager.tickStart,
        tickEnd:manager.tickEnd,
    }
}
export function creepRunner(): (creep: Creep) => void {
    const manager = Container.get(CreepManager)
    return manager.run
}
