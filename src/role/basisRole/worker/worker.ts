import EnergyUtil from "modules/energy/energyUtil";


export default class WorkerConfig implements RoleConfig {

    getReady?(creep: Creep): boolean {
        throw new Error("Method not implemented.");
    }

    getResource?(creep: Creep): boolean {
        throw new Error("Method not implemented.");
    }

    workWithTarget(creep: Creep): boolean {
        throw new Error("Method not implemented.");
    }
    body(room: Room, spawn: StructureSpawn, data: CreepData): BodyPartConstant[] {
        throw new Error("Method not implemented.");
    }
}
