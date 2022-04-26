import { roomManagerCallbacks } from "manager";
import { BaseManager } from "manager/BaseManager";
import { Singleton } from "typescript-ioc";
import { ErrorHelper } from "utils/erroHelper";

@Singleton
export class FlagManager extends BaseManager{
    tickStart(): void {


        if(!Memory.flags) Memory.flags = {}

        for(let name in Memory.flags){
            if(!Game.flags[name]) delete Memory.flags[name]
        }


        const flags:{[roomName in string]:Flag[]} = {}

        for(let name in Game.flags){
            // const strLs = name.split("_")
            const roomName = Game.flags[name].getRoomName()
            const room = Game.flags[name].getRoom()

            if(room && roomName){
                flags[roomName] = flags[roomName] || []
                flags[roomName].push(Game.flags[name])
            }

        }

        for(let name in flags){
            Game.rooms[name].setFlags(flags[name])
        }
    }
    tickEnd(): void {

    }


    getFlagsByPrefix(prefix:string):Flag[]{
        if(!Game._flagPrefixMap){
            const map:FlagPreFixMap = Game._flagPrefixMap = {}
            _.values<Flag>(Game.flags).forEach(flag => {
                const p = flag.getPrefix()
                if(p){
                    if(map[p]) map[p].push(flag)
                    else map[p] = [flag]
                }
            })
        }
        return Game._flagPrefixMap[prefix] || []
    }
}
