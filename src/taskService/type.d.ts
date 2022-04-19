
interface CreepMemory {
    role: string;
    spawnRoom: string;
    tasks:Task[];
}

interface Task {
    serviceName:string
    actionName: string;
    haveToReg:boolean;
    haveToUnreg:boolean;
    targetId: string;
    roomName:string;
    x:number;
    y:number;
}

type TaskFunction = (creep:Creep) => void
