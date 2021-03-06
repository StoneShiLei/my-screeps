interface CreepMemory {
    role: Role;
    tasks:Task[];
}

interface Room {
    _used:{
        [key:string]:number
    }
}

type Role = "worker" | "transporter" | "energyHarvester" | "upgrader" |
 "scouter" | "reserver" | "outterHarDefenser" | "outterHarTransporter" |
 "claimer" | 'test' | 'lowLevelDefenser' | "mineralHarvester"


interface Task {
    serviceName:string
    actionName: string;
    regServiceName?:string
    regName?:string;
    unregName?:string;
    targetId: Id<TaskTarget> | string;
    roomName:string;
    x:number;
    y:number;
    opt?:TaskOpt;
    anyData?:{[key:string]:any}
}

type TaskFunction = (creep:Creep) => void
type TaskOpt = TransportTaskOpt
type TransportTaskOpt = {
    resourceType?:ResourceConstant;
    resourceCount?:number
    fromStorage?:boolean
}
type TaskTarget = Nuke | Deposit | Mineral | Resource | Source | Structure | ConstructionSite | Ruin | Tombstone | Creep | PowerCreep | Flag


