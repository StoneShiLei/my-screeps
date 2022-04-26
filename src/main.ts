import { createApp } from "modules/framework";
import mountAll from "mount"
import { creepManagerCallbacks, creepRunner, flagManagerCallbacks, roomManagerCallbacks, roomRunner } from "manager";
import mountModules from "modules/index";
import { TaskHelper } from "taskService/taskHelper";
import { ErrorHelper } from "utils/erroHelper";
import { Container } from "typescript-ioc";
import { TaskServiceProxy } from "taskService";
import autoPlanner63 ,{StructMap, StructsData} from "autoPlanner63"
import { SourceTaskNameEntity } from "taskService/sourceTaskService/sourceTaskNameEntity";


const app = createApp({
  roomRunner:roomRunner(),
  creepRunner:creepRunner()
})

app.on(mountModules())
app.on(mountAll())

app.on(roomManagerCallbacks())
app.on(creepManagerCallbacks())
app.on(flagManagerCallbacks())

app.on({
  tickStart: () => {

    let roomStructsData:StructsData | undefined = undefined //放全局变量

    let p = Game.flags.p;
    let pa = Game.flags.pa;
    let pb = Game.flags.pb;
    let pc = Game.flags.pc;
    let pm = Game.flags.pm;

    if(p) {
      roomStructsData = autoPlanner63.ManagerPlanner.computeManor(p.pos.roomName,[pc,pm,pa,pb])
      Game.flags.p.remove()
  }
  if(roomStructsData){
      //这个有点消耗cpu 不看的时候记得关
      autoPlanner63.HelperVisual.showRoomStructures(roomStructsData.roomName,roomStructsData.structMap)
  }


  const service = Container.get(TaskServiceProxy).spawnTaskService
  const room = Game.rooms['E48S6']


  if(room.creeps('test')?.length == 0 && room.memory._test && room.memory._test + 1000 < Game.time || !room.memory._test){
    service.trySpawn(room,room.name,'test',-100,[],(args:BodyCalcFuncArgs) => [CLAIM,CLAIM,MOVE,MOVE],{})
    room.memory._test = Game.time
  }

  const testCreep = room.creeps('test').head()
  const pos = new RoomPosition(44,25,'E47S6')
  if(testCreep){
    if(!testCreep.pos.isNearTo(pos) && !testCreep.memory._test){

      testCreep.goTo(pos)
      return
    }

    if(testCreep.pos.isNearTo(pos) && !testCreep.memory._test){
      const controller = Game.rooms[pos.roomName].controller as StructureController
      const result = testCreep.attackController(controller)
      if(result === OK){
        testCreep.memory._test = true
      }
    }


    const newpos = new RoomPosition(15,18,'E48S6')
    if(!testCreep.pos.isEqualTo(newpos) && testCreep.memory._test){
      testCreep.goTo(newpos)
      return
    }
    else{
      Game.spawns["Spawn1"].recycleCreep(testCreep)
    }
  }


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
    _test:number
  }

  export interface CreepMemory{
    _test:boolean
  }
}
