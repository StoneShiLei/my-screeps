import { BaseManager } from "manager/BaseManager";
import { AppLifecycleCallbacks } from "modules/framework/types";
import { Container, Singleton } from "typescript-ioc";

@Singleton
export class RoomManager extends BaseManager{
    tickStart(): void {
        Object.values(Game.rooms).forEach(room => { room.update() })
    }
    tickEnd(): void {

    }
    run(target: Room): void {

    }

}



