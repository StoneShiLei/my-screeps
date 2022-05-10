import { createApp, showCpuCost, switchShowCost } from "modules/framework";
import mountAll from "mount"
import { autoPlanManagerCallbacks, creepManagerCallbacks, creepRunner, flagManagerCallbacks, roomManagerCallbacks, roomRunner } from "manager";
import mountModules from "modules/index";
import { ErrorHelper } from "utils/erroHelper";
import { Container } from "typescript-ioc";
import { TaskServiceProxy } from "taskService";
import { StackAnalysis } from "modules/stackAnalysis/StackAnalysis";
import { BodyConfig } from "modules/bodyConfig/bodyConfig";
import { StructMap } from "autoPlanner63";
import { TaskHelper } from "taskService/taskHelper";
import { TransportTaskNameEntity } from "taskService/transportTaskService/transportTaskNameEntity";



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



app.on({
  tickStart:()=>{

    // const room = Game.rooms['E48S6']
    // room.creeps("transporter").filter(c => c.isIdle() && c.storeIsEmpty())
    // .pop()?.addTask([
    //   TaskHelper.genTaskWithTarget(Game.getObjectById<StructureLab>("6269bff8f398464588f8ddee") as TaskTarget,new TransportTaskNameEntity("fillResource"),{resourceType:"energy" ,resourceCount:2000}),
    //   TaskHelper.genTaskWithTarget(Game.getObjectById<StructureLab>("6269a942b3441f2e70b6253f") as TaskTarget,new TransportTaskNameEntity("transportResource"),{resourceType:"energy" ,resourceCount:2000})
    // ])

    // const creep = Game.getObjectById<Creep>("626eb6cf3f39440103cd77e8")
    // if(creep) creep.goTo(Game.getObjectById<StructureLab>('6269bff8f398464588f8ddee') as StructureLab)
    // @ts-ignore
    // Game.getObjectById("6269bff8f398464588f8ddee").runReaction(Game.getObjectById("6269a7a7358e93ca6e459c2c"),Game.getObjectById("6269d9fef2de037b5e3421b9"))
    // Game.getObjectById("626eb6cf3f39440103cd77e8").moveTo(Game.getObjectById('6269bff8f398464588f8ddee').pos)
    // const room = Game.rooms['E48S6']

    // const struct:StructMap = {
    //   constructedWall:[[2,14],[2,15],[6,19],[6,20],[8,23],[9,23],[10,23],[31,26],[43,26],[44,25],[46,12],[46,11],[46,10]],
    //   rampart:[[6,21],[30,26],[43,25],[46,13]],
    //   spawn:room.find(FIND_STRUCTURES,{filter:s => s.structureType == STRUCTURE_SPAWN}).map(x => [x.pos.x,x.pos.y]),
    //   extension:room.find(FIND_STRUCTURES,{filter:s => s.structureType == STRUCTURE_EXTENSION}).map(x => [x.pos.x,x.pos.y]),
    //   link:room.find(FIND_STRUCTURES,{filter:s => s.structureType == STRUCTURE_LINK}).map(x => [x.pos.x,x.pos.y]),
    //   road:room.find(FIND_STRUCTURES,{filter:s => s.structureType == STRUCTURE_ROAD}).map(x => [x.pos.x,x.pos.y]),
    //   storage:room.find(FIND_STRUCTURES,{filter:s => s.structureType == STRUCTURE_STORAGE}).map(x => [x.pos.x,x.pos.y]),
    //   tower:room.find(FIND_STRUCTURES,{filter:s => s.structureType == STRUCTURE_TOWER}).map(x => [x.pos.x,x.pos.y]),
    //   observer:[],
    //   powerSpawn:[],
    //   extractor:room.find(FIND_STRUCTURES,{filter:s => s.structureType == STRUCTURE_EXTRACTOR}).map(x => [x.pos.x,x.pos.y]),
    //   terminal:room.find(FIND_STRUCTURES,{filter:s => s.structureType == STRUCTURE_TERMINAL}).map(x => [x.pos.x,x.pos.y]),
    //   lab:[],
    //   container:room.find(FIND_STRUCTURES,{filter:s => s.structureType == STRUCTURE_CONTAINER}).map(x => [x.pos.x,x.pos.y]),
    //   nuker:[],
    //   factory:[],
    // }

    // room.memory.structMap = struct

    if(Game.cpu.bucket == 10000) {
      Game.cpu.generatePixel();
    }
  }
})


app.on({
  tickStart:()=>{

  }
})


// switchShowCost('base')
// StackAnalysis.mount()
export const loop = app.run
// export const loop = StackAnalysis.wrap(app.run)
