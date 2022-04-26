import { createApp } from "modules/framework";
import mountAll from "mount"
import { autoPlanManagerCallbacks, creepManagerCallbacks, creepRunner, flagManagerCallbacks, roomManagerCallbacks, roomRunner } from "manager";
import mountModules from "modules/index";
import { ErrorHelper } from "utils/erroHelper";
import { Container } from "typescript-ioc";
import { TaskServiceProxy } from "taskService";
import autoPlanner63 ,{ StructsData} from "autoPlanner63"


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


//   if(room.creeps('test')?.length < 4){
//     service.trySpawn(room,room.name,'test',10000,[],(args:BodyCalcFuncArgs) => BodyConfig.calcBodyParts({attack:4,ranged_attack:1,heal:1,move:10}),{})
//   }

//   const testCreeps = room.creeps('test')
//   const pos = new RoomPosition(44,25,'E47S6')
//   testCreeps.forEach(testCreep =>{
//     if(testCreep){
//       if(testCreep.room.name !=  pos.roomName){
//         testCreep.goTo(pos)
//         return
//       }

//       let em:Structure | AnyCreep = testCreep.room.find(FIND_HOSTILE_CREEPS).head()
//       if(!em) em = testCreep.room.find(FIND_HOSTILE_STRUCTURES).filter(s => s.structureType != STRUCTURE_CONTROLLER && s.structureType != STRUCTURE_RAMPART).head()
//       if(em){
//           if(testCreep.attack(em) == ERR_NOT_IN_RANGE){
//             testCreep.goTo(em)
//             testCreep.heal(testCreep)
//           }
//           testCreep.rangedAttack(em)
//           return
//       }
// console.log(em)
//       const injuredCreep = testCreep.pos.findClosestByPath(FIND_MY_CREEPS,{filter:e=>e.hits != e.hitsMax})
//       if(injuredCreep && testCreep.heal(injuredCreep) == ERR_NOT_IN_RANGE){
//         testCreep.goTo(injuredCreep)
//           return
//       }

//       const mineral = testCreep.topTarget
//       if(mineral && !testCreep.pos.inRangeTo(mineral,3)){
//         testCreep.goTo(mineral)
//       }
//     }
//   })



  //@ts-ignore
//  Game.getObjectById('626687a16ae82b9510fd3175').addTask(TaskHelper.genTaskWithServiceData(Memory.rooms['E49S6'].serviceDataMap.sourceTaskService['5bbcaff69099fc012e63b6e0'],new SourceTaskNameEntity("harvestOutterTransport")))

  //   // try{
    //   const func:(...args: any[])=>number = function(str:string,num1:number,num2:number):number{
    //     console.log(str)
    //     return num1 + num2
    //   }

    //   const obj = {
    //     a:"1",
    //     b:1,
    //     c:2
    //   }

    //   const result =  func(obj)
    //   console.log(result)
    // }
    // catch(e){
    //   if(e instanceof Error){
    //     console.log(e.stack)
    //   }
    // }

    // debugger
    // const room = Game.rooms['E48S6']
    // const creep = room.creeps("worker").head()
    // console.log('room var is ' + room._creeps)

    // console.log('creep is ' + creep)
    // console.log('creeps is ' + room.creeps())
    // console.log(JSON.stringify((room.get('extension') as StructureExtension[]).length))
    // const id = Game.flags['Flag1'].id
    // console.log(id)
    // const container1 = Game.getObjectById<StructureContainer>('52b1d1b3199bee0569673a54')
    // const container2 = Game.getObjectById<StructureContainer>('3d9a6944e2bf0780cf53edbd')
    // const creep = Game.creeps['test12']
    // if(container1  && container2&& creep &&creep.isIdle() &&! creep.spawning && Game.time % 50 === 0){
    //   creep.addTask(TaskHelper.genTaskWithTarget(container2,"transportTaskService","fillResource",{
    //     resourceType:RESOURCE_ENERGY,resourceCount:170
    //   }))
      // creep.addTask(TaskHelper.genTaskWithTarget(container1,"transportTaskService","transportResource",{
      //   resourceType:RESOURCE_ENERGY,resourceCount:70
      // }))

      // const service = Container.get(TaskServiceProxy)
      // if(room.creeps('worker').length != 1 && container2){
      //   service.spawnTaskService.trySpawn(room,room.name,'worker',10,[TaskHelper.genTaskWithTarget(container2,"transportTaskService","transportResource",{
      //     resourceType:RESOURCE_ENERGY,resourceCount:170
      //   })],(room:Room) => [WORK,CARRY,MOVE])
      // }

    //@ts-ignore
    // console.log((container1 as AnyStoreStructure).store.getFreeCapacity())

  },
  tickEnd:()=>{
    ErrorHelper.throwAllErrors()
  }
})

export const loop = app.run




declare global {
  export interface RoomMemory{
    _test?:number
  }

  export interface CreepMemory{
    _test?:boolean
  }
}
