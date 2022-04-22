import { roomManagerCallbacks } from "manager";
import { BaseManager } from "manager/BaseManager";
import { Singleton } from "typescript-ioc";
import { ErrorHelper } from "utils/erroHelper";

@Singleton
export class AutoPlanManager extends BaseManager{
    tickStart(): void {
        // _.values<Room>(Game.rooms).forEach(room => {

        // })

    }
    tickEnd(): void {

    }


}
