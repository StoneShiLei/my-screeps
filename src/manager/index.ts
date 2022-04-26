import { AppLifecycleCallbacks } from "modules/framework/types"
import { Container } from "typescript-ioc"
import { AutoPlanManager } from "./autoPlanManager/autoPlanManager"
import { CreepManager } from "./creepManager/creepManager"
import { FlagManager } from "./flagManager/flagManager"
import { RoomManager } from "./roomManager/roomManager"


/**
 * 注意委托给框架执行的function
 * 不能调用class内部的变量
 */

export function roomManagerCallbacks():AppLifecycleCallbacks{
    const manager = Container.get(RoomManager)
    return {
        tickStart:()=>manager.tickStart(),
        tickEnd:()=>manager.tickEnd(),
    }
}
export function roomRunner(): (room: Room) => void {
    const manager = Container.get(RoomManager)
    return (room:Room) => manager.run(room)
}


export function creepManagerCallbacks():AppLifecycleCallbacks{
    const manager = Container.get(CreepManager)
    return {
        tickStart:() => manager.tickStart(),
        tickEnd:() => manager.tickEnd(),
    }
}
export function creepRunner(): (creep: Creep) => void {
    const manager = Container.get(CreepManager)
    return (creep:Creep) => manager.run(creep)
}

export function flagManagerCallbacks():AppLifecycleCallbacks{
    const manager = Container.get(FlagManager)
    return {
        tickStart:() => manager.tickStart(),
        tickEnd:() => manager.tickEnd(),
    }
}

export function autoPlanManagerCallbacks():AppLifecycleCallbacks{
    const manager = Container.get(AutoPlanManager)
    return {
        tickStart:() => manager.tickStart(),
        tickEnd:() => manager.tickEnd(),
    }
}
