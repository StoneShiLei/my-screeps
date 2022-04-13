

export default class Worker {

    work(creep:Creep){

        if(creep.memory.working && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.working = false;
            creep.say('🔄 harvest');
        }
        if(!creep.memory.working && creep.store.getFreeCapacity() == 0) {
            creep.memory.working = true;
            creep.say('🚧 working');
        }

        const constructSites = creep.room.find(FIND_CONSTRUCTION_SITES);

        if(constructSites.length > 0 && creep.memory.working) {
            if(creep.build(constructSites[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(constructSites[0]);
            }
        }
        else if(creep.memory.working && creep.room.controller != null){
            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller);
            }
        }
        else{
            const sources = creep.room.find(FIND_SOURCES);
            if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }
    }


}
