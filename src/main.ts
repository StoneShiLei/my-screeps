import superMove from "superMove"

import { createApp } from "modules/framework";
import { roomRunner, creepRunner, createGlobalExtension } from "modules";
import { creepControllerService } from "modules/spawnController";



const app = createApp({roomRunner,creepRunner})
app.on(createGlobalExtension())
app.on(creepControllerService())


app.on({
  tickStart:()=>{
    // console.log(Game.rooms['sim'].spawnController.spawnTaskQueue)
  },
})

export const loop = app.run


