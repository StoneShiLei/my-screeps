import { createApp } from "modules/framework";
import mountAll from "mount"
import { creepManagerCallbacks, creepRunner, roomManagerCallbacks, roomRunner } from "manager";
import mountModules from "modules/index";
import { TaskHelper } from "taskService/taskHelper";
import { ErrorHelper } from "utils/erroHelper";


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
    const room = Game.rooms['sim']

    // console.log(JSON.stringify((room.get('extension') as StructureExtension[]).length))
    // const id = Game.flags['Flag1'].id
    // console.log(id)
    const container = Game.getObjectById<StructureContainer>('61fc4e83493c2f9c4644925a')

    const creep = Game.creeps['test12']
    debugger
// console.log(container,creep)
    if(container != null && !creep.hasTasks()){
      creep.addTask(TaskHelper.genTaskWithTarget(container,'transportTaskService','transportResource',
      {resouceType:RESOURCE_ENERGY,resourceCount:30},false,false))
    }

  },
  tickEnd:()=>{
    ErrorHelper.throwAllErrors()
  }
})

export const loop = app.run




