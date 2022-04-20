import { BaseManager } from "manager/BaseManager";
import { AppLifecycleCallbacks } from "modules/framework/types";
import { Container, Singleton } from "typescript-ioc";
import { superMove } from 'modules/superMove'

@Singleton
export class RoomManager extends BaseManager{
    tickStart(): void {
        Object.values(Game.rooms).forEach(room => {
            const interval = Game.time + room.hashCode()

            if(interval % 31 === 0){
                room.updateRoomInfo()
            }

            if(Game.time + room.hashCode() % 301 === 0){
                superMove.deletePathInRoom(room.name)
            }
         })
    }
    tickEnd(): void {

    }
    run(target: Room): void {

    }

}



