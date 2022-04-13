
interface CreepMemory {
    role: string;
    spawnRoom: string;
    working: boolean;
    data:CreepData
}

interface CreepData{
    harvesterData?:HarvesterData
    // transporterData?:TransporterData
    workerData?:WorkerData
    centerData?:CenterData
}

interface EmptyData{}

interface HarvesterData{
    //资源id
    sourceID:Id<Source>
    //工作目标id
    targetID?:Id<Structure>
    //为该房间工作
    workRoom:string
    //要采集的房间
    harvestRoom:string
    //工作模式
    // harvestMode?:AllHarvestMode
    //能量丢弃位置 roomName,x,y
    droppedPos?:string
}

interface WorkerData{
    //该 creep 的工作房间
    workRoom: string
}

// interface TransporterData{
//     //要使用的资源存放建筑 id
//     sourceID?:Id<StructureWithStore>
//     //该 creep 的工作房间
//     //例如一个外矿搬运者需要知道自己的老家在哪里
//     workRoom: string
// }

interface CenterData {
    x: number
    y: number
}
