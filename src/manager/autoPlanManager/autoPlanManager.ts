import { BaseManager } from "manager/BaseManager";
import { Singleton } from "typescript-ioc";
import { autoPlanStrategy } from "./autoPlanStrategy";


@Singleton
export class AutoPlanManager extends BaseManager{
    tickStart(): void {
        // _.values<Room>(Game.rooms).forEach(room => {

        // })

    }
    tickEnd(): void {
        autoPlanStrategy.showRoom();
        autoPlanStrategy.computeAnyRoom();
    }

    computeRoom(flag:Flag){
        autoPlanStrategy.computeRoom(flag);
    }

    tryAutoBuildLowLevel(room:Room){
        autoPlanStrategy.tryAutoBuildLowLevel(room);
    }

    tryAutoBuildMiddleLevel(room:Room){
        autoPlanStrategy.tryAutoBuildMiddleLevel(room);
    }

    tryAutoBuildHighLevel(room:Room){
        autoPlanStrategy.tryAutoBuildHighLevel(room);
    }
}
