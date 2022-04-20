
interface CreepMemory {
    role: Role;
    spawnRoom: string;
    tasks:Task[];
}

type Role = "worker" | "transporter"


interface Task {
    serviceName:string
    actionName: string;
    haveToReg:boolean;
    haveToUnreg:boolean;
    targetId: Id<TaskTarget>;
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
}
type TaskTarget = Nuke | Deposit | Mineral | Resource | Source | Structure | ConstructionSite | Ruin | Tombstone | Creep | PowerCreep | Flag
