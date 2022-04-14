import EnergyUtil from "modules/energy/energyUtil";


export default class Worker {

    work(creep:Creep){

        if(creep.memory.working && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.working = false;
            creep.say('🔄 harvest');

            let resource:AllEnergySource | null = null
            if(!creep.memory.sourceId){
                resource = EnergyUtil.getRoomEnergyTarget(creep.room)
                if(!resource) resource = creep.room.find(FIND_SOURCES,{filter:s => s.canUse()})[0]
                if(!resource){
                    creep.say('no energy!')
                    return
                }
                creep.memory.sourceId = resource.id
            }
        }
        if(!creep.memory.working && creep.store.getFreeCapacity() == 0) {
            creep.memory.working = true;
            creep.say('🚧 working');
        }

        const closestDamagedStructure = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => structure.structureType != STRUCTURE_WALL &&
                    structure.hits < structure.hitsMax
                });
        const constructSite = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
        if(creep.memory.working && closestDamagedStructure){
            if(creep.repair(closestDamagedStructure) == ERR_NOT_IN_RANGE){
                creep.goTo(closestDamagedStructure);
            }
        }

        else if(creep.memory.working && constructSite) {
            if(creep.build(constructSite) == ERR_NOT_IN_RANGE) {
                creep.goTo(constructSite);
            }
        }
        else if(creep.memory.working && creep.room.controller != null){
            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.goTo(creep.room.controller);
            }
        }
        else if(creep.memory.working && creep.room.controller != null){
            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.goTo(creep.room.controller);
            }
        }
        else{

            if(creep.memory.sourceId){
                const resource = Game.getObjectById(creep.memory.sourceId)
                if(!resource || (resource instanceof Structure && resource.store[RESOURCE_ENERGY] < 300) ||
                (resource instanceof Source && resource.energy == 0) ||
                ((resource instanceof Ruin || resource instanceof Tombstone) && resource.store[RESOURCE_ENERGY] === 0)) {
                    delete creep.memory.sourceId
                }

                if(!resource){
                    creep.say('no energy!')
                    return
                }

                creep.getEngryFrom(resource)
            }
        }
    }


}
