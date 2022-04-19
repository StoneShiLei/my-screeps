
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
    targetId: string;
    roomName:string;
    x:number;
    y:number;
    opt:TaskOpt;
}

type TaskFunction = (creep:Creep) => void
type TaskOpt = {
    [key:string]:string
}
type TaskTarget = Nuke | Deposit | Mineral | Resource | Source | Structure | ConstructionSite | Ruin | Tombstone | Creep | PowerCreep
