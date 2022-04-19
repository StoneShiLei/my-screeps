import superMove from "superMove"
import { createApp } from "modules/framework";
import { TaskServiceProxy } from "taskService";
import { Container } from "typescript-ioc";
import mountAll from "mount"
import { creepManagerCallbacks, creepRunner, roomManagerCallbacks, roomRunner } from "manager";
import { BodyConfig } from "modules/bodyConfig/bodyConfig";



const app = createApp({roomRunner,creepRunner})
app.on(mountAll())
app.on(roomManagerCallbacks())
app.on(creepManagerCallbacks())
app.on({
  tickStart: () => {
    const x:BodySet = [[WORK,2],[CARRY,1],[MOVE,1]]
    const y = BodyConfig.calcBodyParts(x);
    console.log(y)
    console.log(BodyConfig.getBodyCosts(y))

    const z:BodySet = {"work":2,"carry":1,"move":1}
    const zy = BodyConfig.calcBodyParts(z);
    console.log(zy)
    console.log(BodyConfig.getBodyCosts(zy))
  }
})

export const loop = app.run




