interface CreepMemory {
    role: Role;
    tasks:Task[];
}

type Role = "worker" | "transporter"


interface Task {
    serviceName:string
    actionName: string;
    regName?:string;
    unregName?:string;
    targetId: Id<TaskTarget> | string;
    roomName:string;
    x:number;
    y:number;
    opt?:TaskOpt;
}

type TaskFunction = (creep:Creep) => void
type TaskOpt = TransportTaskOpt
type TransportTaskOpt = {
    resouceType?:ResourceConstant;
    resourceCount?:number
    fromStorage?:boolean
}
type TaskTarget = Nuke | Deposit | Mineral | Resource | Source | Structure | ConstructionSite | Ruin | Tombstone | Creep | PowerCreep | Flag


