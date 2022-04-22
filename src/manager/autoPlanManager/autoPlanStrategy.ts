import autoPlanner63,{ StructMap } from "autoPlanner63"

export const autoPlanStrategy = {
    tryAutoBuildLowLevel(room:Room){
        if(Game.time + room.hashCode() % 150 == 0 && Game.cpu.bucket > 50 && room.memory.structMap){
            _plannStrategy._traCreateStructs(room,room.memory.structMap,STRUCTURE_SPAWN)
            _plannStrategy._traCreateStructs(room,room.memory.structMap,STRUCTURE_EXTENSION)
        }
    },
    tryAutoBuildMiddleLevel(room:Room){
        if(Game.time + room.hashCode() % 150 == 0 && Game.cpu.bucket > 50 && room.memory.structMap){
            _plannStrategy._traCreateStructs(room,room.memory.structMap,STRUCTURE_EXTENSION)
            _plannStrategy._traCreateStructs(room,room.memory.structMap,STRUCTURE_CONTAINER,3)
            _plannStrategy._traCreateStructs(room,room.memory.structMap,STRUCTURE_TOWER)

            if(room.get<StructureExtension[]>("extension").length >= 20){
                _plannStrategy._traCreateStructs(room,room.memory.structMap,STRUCTURE_STORAGE)
            }

            _plannStrategy._traCreateStructs(room,room.memory.structMap,STRUCTURE_ROAD)
        }
    },
    tryAutoBuildHighLevel(room:Room){
        if((Game.time+room.hashCode()) % 600 == 0 && Game.cpu.bucket>500&&room.memory.structMap){

            _.keys(CONTROLLER_STRUCTURES).forEach(sturct =>{
                if(sturct == STRUCTURE_RAMPART || sturct == STRUCTURE_WALL) return

                _plannStrategy._traCreateStructs(room,room.memory.structMap,sturct as BuildableStructureConstant)
            })
        }
    },
    showRoom(){
        const show = Game.flags.showBlueprint
        if(show && Memory.rooms[show.pos.roomName].structMap){
            autoPlanner63.HelperVisual.showRoomStructures(show.pos.roomName,Memory.rooms[show.pos.roomName].structMap)
        }
    },
    // computeAnyRoom(){},
    // computeRoom(roomObj:RoomObject){
    //     if(Game.cpu.bucket < 300 || !roomObj.room) return
    //     const points:RoomObject[] = []

    //     const map = Memory.rooms[roomObj.pos.roomName].serviceDataMap["upgradeTaskService"]
    //     if(!map || !map[STRUCTURE_CONTROLLER]) return
    //     const data = map[STRUCTURE_CONTROLLER]

    //     points = points.concat([data])
    //     const roomStructsData = autoPlanner63.ManagerPlanner.computeManor(roomObj.room.name,)
    // }
}

const posCodeNumberMap:{[key:number]:string} = {};
const posCodeCharMap:{[key:string]:number} = {};

(function (){
    let a ='a'.charCodeAt(0)
    let A ='A'.charCodeAt(0)
    for(let i=0;i<25;i++){
        let b = String.fromCharCode(a+i)
        let j = 25+i
        let B = String.fromCharCode(A+i)
        posCodeNumberMap[i] = b
        posCodeCharMap[b] = i
        posCodeNumberMap[j] = B
        posCodeCharMap[B] = j
    }
}())


const _plannStrategy = {
    _traCreateStructs(room:Room,structMap:StructMap,struct:BuildableStructureConstant,structCount:number = 2500){
        structCount = Math.min(structCount,CONTROLLER_STRUCTURES[struct][room.level])
        if(structMap[struct]){
            let needBuild = false
            const roomStruct = room.get(struct)
            if(roomStruct instanceof Array){
                if(structCount > roomStruct.length) needBuild = true
            }
            else if(roomStruct && (roomStruct as BuildableStructureConstant)){
                needBuild = true
            }
            else{}

            if(needBuild){
                const pos = structMap[struct]

                _.take(pos,structCount).forEach(p=>{
                    this._tryCreateCons(new RoomPosition(p[0],p[1],room.name),struct)
                })
            }
        }
    },
    _tryCreateCons(pos:RoomPosition,struct:BuildableStructureConstant){
        const room = Game.rooms[pos.roomName]
        const sites = room.get<ConstructionSite[]>("constructionSite")
        if(sites.length + (room._construct_builed || 0) < 10){
            let head = pos.lookFor(LOOK_STRUCTURES).filter(e => e.structureType == struct).head()
            if(!head){
                room._construct_builed = (room._construct_builed || 0) + 1
                pos.createConstructionSite(struct)
            }
        }
    }
}

// export function decodePosArray(pos:[number,number][]):Array<{x:number,y:number}>{
//     let out = []
//     for(let i=0;i<pos.length;i+=2){
//         out.push({x:posCodeCharMap[pos[i]],y:posCodeCharMap[pos[i+1]]})
//     }
//     return out
// }

// export function encodePosArray(posArray:{x:number,y:number}[]){
//     return posArray.map(pos => posCodeNumberMap[pos.x] + posCodeNumberMap[pos.y])
//         .reduce((a,b)=>a+b,"")
// }


declare global{
    export interface Room{
        _construct_builed:number
    }
}
