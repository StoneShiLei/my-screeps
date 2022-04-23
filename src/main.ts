import { createApp } from "modules/framework";
import mountAll from "mount"
import { creepManagerCallbacks, creepRunner, roomManagerCallbacks, roomRunner } from "manager";
import mountModules from "modules/index";
import { TaskHelper } from "taskService/taskHelper";
import { ErrorHelper } from "utils/erroHelper";
import { Container } from "typescript-ioc";
import { TaskServiceProxy } from "taskService";
import autoPlanner63 ,{StructMap, StructsData} from "autoPlanner63"


const app = createApp({
  roomRunner:roomRunner(),
  creepRunner:creepRunner()
})

app.on(mountModules())
app.on(mountAll())

app.on(roomManagerCallbacks())
app.on(creepManagerCallbacks())


app.on({
  tickStart: () => {

  //   let roomStructsData:StructsData | undefined = undefined //放全局变量

  //   let p = Game.flags.p;
  //   let pa = Game.flags.pa;
  //   let pb = Game.flags.pb;
  //   let pc = Game.flags.pc;
  //   let pm = Game.flags.pm;

  //   if(p) {
  //     roomStructsData = autoPlanner63.ManagerPlanner.computeManor(p.pos.roomName,[pc,pm,pa,pb])
  //     Game.flags.p.remove()
  // }
  // if(roomStructsData){
  //     //这个有点消耗cpu 不看的时候记得关
  //     autoPlanner63.HelperVisual.showRoomStructures(roomStructsData.roomName,roomStructsData.structMap)
  // }
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




