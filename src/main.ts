import { ErrorMapper } from "utils/ErrorMapper";
import HarvesterRole from "role/basisRole/harvester/harvester";
import WorkerRole from "role/basisRole/worker/worker";
import BodyAutoConfig from "modules/bodyConfig/bodyConfig";
import { mountRoom } from "modules/room";
import mountRoomPosition from "modules/roomPosition";
import CreepReleaser from "modules/spawnController/creepReleaser";
import { mountCreep } from "modules/creep";
import movement from 'movement';
import watchClient from 'watch-client';
// require('superMove')


//挂载room
mountRoom()
//挂载position
mountRoomPosition()
//挂载creep
mountCreep()


export const loop = ErrorMapper.wrapLoop(() => {
  movement.prepare();


  for(const roomName in Game.rooms){
    const spawner = new CreepReleaser(roomName)
    spawner.releaseHarvester()
  }

  for (const name in Memory.creeps) {
    if(name.indexOf('harvester') != -1) continue

    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }

  const worker = _.filter(Game.creeps, (creep) => creep.memory.role == 'worker');

  if(worker.length < 3) {
    const newName = 'Worker' + Game.time;
      const spawn = Game.spawns['Spawn1'];
      const bodyConfig = BodyAutoConfig.bodyConfigs.worker;
      const bodyParts = BodyAutoConfig.createBodyGetter(bodyConfig)(spawn.room,spawn);
      spawn.spawnCreep(bodyParts, newName, {memory:{role: 'worker', working: true, spawnRoom: spawn.room.name,data:{}}});
  }

  // const tower = Game.getObjectById<StructureTower>('49f58a91ce4979c2874cd624');
  // if(tower) {
  //     var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
  //         filter: (structure) => structure.hits < structure.hitsMax
  //     });
  //     if(closestDamagedStructure) {
  //         tower.repair(closestDamagedStructure);
  //     }

  //     var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
  //     if(closestHostile) {
  //         tower.attack(closestHostile);
  //     }
  // }

  const harvesterRole = new HarvesterRole()
  const workerRole = new WorkerRole()

  for(const name in Game.creeps) {
    const creep = Game.creeps[name]
    if(creep.memory.role == 'harvester') {
      harvesterRole.work(creep)
    }
    if(creep.memory.role == 'worker') {
      workerRole.work(creep)
    }
}


  movement.process();
  watchClient();
});
