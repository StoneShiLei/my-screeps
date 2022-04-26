import { superMoveJS } from "./superMove";
import { structureCache } from "./structureCache";
import { AppLifecycleCallbacks } from "./framework/types";

export default function mountModules():AppLifecycleCallbacks{
    superMoveJS();
    structureCache();
    return {
        born:()=>{

        },
        tickStart:()=>{

        },
        tickEnd:()=>{

        },
    }
}
