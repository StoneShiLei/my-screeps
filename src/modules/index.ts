import { superMoveJS } from "./superMove";
import { structureCache } from "./structureCache";
import { AppLifecycleCallbacks } from "./framework/types";
import watch from "watch-client";

export default function mountModules():AppLifecycleCallbacks{
    superMoveJS();
    structureCache();

    return {
        born:()=>{

        },
        tickStart:()=>{

        },
        tickEnd:()=>{
            // watch()
        },
    }
}
