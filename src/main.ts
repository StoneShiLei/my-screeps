import { createApp, showCpuCost, switchShowCost } from "modules/framework";
import mountAll from "mount"
import { autoPlanManagerCallbacks, creepManagerCallbacks, creepRunner, flagManagerCallbacks, roomManagerCallbacks, roomRunner } from "manager";
import mountModules from "modules/index";
import { ErrorHelper } from "utils/erroHelper";
import { Container } from "typescript-ioc";
import { TaskServiceProxy } from "taskService";
import { StackAnalysis } from "modules/stackAnalysis/StackAnalysis";
import { BodyConfig } from "modules/bodyConfig/bodyConfig";



const app = createApp({
  roomRunner:roomRunner(),
  creepRunner:creepRunner()
})

app.on(mountModules())
app.on(mountAll())

app.on(roomManagerCallbacks())
app.on(creepManagerCallbacks())
app.on(flagManagerCallbacks())
app.on(autoPlanManagerCallbacks())



app.on({
  tickStart: () => {

    const service = Container.get(TaskServiceProxy).spawnTaskService
    const room = Game.rooms['E48S6']

    const flag = Game.flags["attack"];
    if(!flag) return
    if(room.creeps('test')?.length < 4 && flag){
      service.trySpawn(room,room.name,'test',10000,[],(args:BodyCalcFuncArgs) => BodyConfig.calcBodyParts({attack:4,ranged_attack:1,heal:1,move:10}),{})
    }
    const flagAtt = Game.flags["a"]
    room.creeps('test').forEach(testCreep =>{
      if(testCreep){
        if(testCreep.room.name !=  flag.pos.roomName){
          testCreep.goTo(flag)
          return
        }

        let em:Structure | AnyCreep | null | undefined = undefined
        if(flagAtt){
          em =  flagAtt.pos.lookFor(LOOK_STRUCTURES).head()
        }

        if(!em) em = testCreep.pos.findClosestByPath(FIND_STRUCTURES,{filter:s => s.structureType == STRUCTURE_TOWER})
        if(!em) em = testCreep.pos.findClosestByPath(FIND_HOSTILE_CREEPS)
        if(!em) em = testCreep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES,{filter:s => s.structureType != STRUCTURE_CONTROLLER && s.structureType != STRUCTURE_RAMPART})
        if(em){
            if(testCreep.attack(em) == ERR_NOT_IN_RANGE){
              testCreep.goTo(em)
              testCreep.heal(testCreep)
            }
            testCreep.rangedAttack(em)
            return
        }
        const injuredCreep = testCreep.pos.findClosestByPath(FIND_MY_CREEPS,{filter:e=>e.hits != e.hitsMax})
        if(injuredCreep && testCreep.heal(injuredCreep) == ERR_NOT_IN_RANGE){
          testCreep.goTo(injuredCreep)
            return
        }
        const mineral = testCreep.topTarget
        if(mineral && !testCreep.pos.inRangeTo(mineral,3)){
          testCreep.goTo(mineral)
        }
      }
    })

  },
  tickEnd:()=>{
    ErrorHelper.throwAllErrors()
  }
})

// switchShowCost('base')

// StackAnalysis.mount()
export const loop = app.run
// export const loop = StackAnalysis.wrap(app.run)




// declare global {
//   export interface RoomMemory{
//     _test?:number
//   }

//   export interface CreepMemory{
//     _test?:boolean
//   }
// }
