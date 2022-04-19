import superMove from "superMove"
import { createApp } from "modules/framework";
import { TaskServiceProxy } from "taskService";
import { Container } from "typescript-ioc";
import mountAll from "mount"



// const app = createApp({roomRunner,creepRunner})
const app = createApp()
app.on(mountAll())


app.on({
  tickStart:()=>{

    Game.spawns['Spawn1'].spawnCreep([WORK,CARRY,MOVE],'ceep' + Game.time)

    for(let creep of Object.values(Game.creeps)){
      if(creep.tasks.length == 0){
        creep.addTask({
          serviceName:'spawnTaskService',
          actionName:'func1',
          haveToReg:true,
          haveToUnreg:true,
          targetId:'',
          roomName:creep.room.name,
          x:creep.pos.x,
          y:creep.pos.y
        })
      }

      creep.registerMyTasks()
      creep.unregisterMyTopTask()
      creep.doTopTaskJob()
    }
  },
  tickEnd:()=>{

  }
})

export const loop = app.run




