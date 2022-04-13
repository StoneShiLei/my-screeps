import { ErrorMapper } from "utils/ErrorMapper";
import HarvesterRole from "role/basisRole/harvester/harvester";
import WorkerRole from "role/basisRole/worker/worker";
import BodyAutoConfig from "modules/bodyConfig/bodyConfig";
require('superMove')



export const loop = ErrorMapper.wrapLoop(() => {


  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }

  const harvesters = _.filter(Game.creeps,(creep) => creep.memory.role == 'harvester');

  const worker = _.filter(Game.creeps, (creep) => creep.memory.role == 'worker');

  if(harvesters.length < 2) {
    const newName = 'Harvester' + Game.time;
    const spawn = Game.spawns['Spawn1'];
    const bodyConfig = BodyAutoConfig.bodyConfigs.harvester;
    const bodyParts = BodyAutoConfig.createBodyGetter(bodyConfig)(spawn.room,spawn);
    spawn.spawnCreep(bodyParts, newName, {memory:{role: 'harvester', working: false,room:spawn.room.name}});
  }

  if(worker.length < 2) {
    const newName = 'Worker' + Game.time;
      const spawn = Game.spawns['Spawn1'];
      const bodyConfig = BodyAutoConfig.bodyConfigs.worker;
      const bodyParts = BodyAutoConfig.createBodyGetter(bodyConfig)(spawn.room,spawn);
      spawn.spawnCreep(bodyParts, newName, {memory:{role: 'worker', working: false,room:spawn.room.name}});
  }

  const tower = Game.getObjectById<StructureTower>('49f58a91ce4979c2874cd624');
  if(tower) {
      var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
          filter: (structure) => structure.hits < structure.hitsMax
      });
      if(closestDamagedStructure) {
          tower.repair(closestDamagedStructure);
      }

      var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
      if(closestHostile) {
          tower.attack(closestHostile);
      }
  }

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


  require('watch-client')();
});
