import { ErrorMapper } from "utils/ErrorMapper";
import HarvesterRole from "role/basisRole/harvester/harvester";
import WorkerRole from "role/basisRole/worker/worker";
import BodyAutoConfig from "modules/bodyConfig/bodyConfig";
import { mountRoom } from "modules/room";
import mountRoomPosition from "modules/roomPosition";
import CreepReleaser from "modules/spawnController/creepReleaser";
import { mountCreep } from "modules/creep";
import watchClient from 'watch-client';
import Utils from "utils/utils";
import superMove from "superMove"
//挂载room
mountRoom()
//挂载position
mountRoomPosition()
//挂载creep
mountCreep()


export const loop = ErrorMapper.wrapLoop(() => {


  for(const roomName in Game.rooms){
    const spawner = new CreepReleaser(roomName)
    spawner.releaseHarvester()
  }

  Utils.doing(Game.creeps)

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


  watchClient();
});
