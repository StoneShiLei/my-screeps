

export default class Harvester {

    work(creep:Creep){
        if(creep.store.getFreeCapacity() > 0){
            if(!creep.memory.data.harvesterData?.sourceID) return
                const source = Game.getObjectById(creep.memory.data.harvesterData.sourceID);
                if(!source) return
                if(creep.harvest(source) == ERR_NOT_IN_RANGE){
                    creep.goTo(source);
                }
        }else{
            const targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION ||
                        structure.structureType == STRUCTURE_SPAWN ||
                        structure.structureType == STRUCTURE_TOWER) && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                    }
            });
            if(targets.length > 0){
                if(creep.transfer(targets[0],RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
                    creep.goTo(targets[0]);
                }
            }
        }
    }
}
