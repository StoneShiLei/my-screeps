

interface CreepMemory{
    role: AllRoles;
    ready:boolean;
    working: boolean;
    data:CreepData;
}

interface RoleConfig{
    keepAlive?(room:Room,memory:CreepMemory):boolean
    getReady?(creep:Creep):boolean
    getResource?(creep:Creep):boolean
    workWithTarget(creep:Creep):boolean
    body(room:Room,spawn:StructureSpawn,data:CreepData):BodyPartConstant[]
}


type AllData = EmptyData | HarvesterData | TransporterData | WorkerData | CenterData
type AllRoles = BasisRoles

type BasisRoles = Harvester | Transporter | Worker
type Harvester = "harvester"
type Transporter = "transporter"
type Worker = "worker"
// type Center = "center"


// type RemoteRoles = Claimer | UpgradeSupporter | BuildSupporter
// type Claimer = "claimer"
// type UpgradeSupporter = "upgradeSupporter"
// type BuildSupporter = "buildSupporter"



interface CreepData{
    harvesterData?:HarvesterData
    transporterData?:TransporterData
    workerData?:WorkerData
    centerData?:CenterData
}

interface BaseData{
    //该角色的creep唯一id
    id:number
}

interface EmptyData extends BaseData{}

interface HarvesterData extends BaseData{
    //资源id
    sourceID:Id<Source>
    //工作目标id
    targetID?:Id<Structure>
    //为该房间工作
    workRoom:string
    //要采集的房间
    harvestRoom:string
    //工作模式
    harvestMode?:AllHarvestMode
    //能量丢弃位置 roomName,x,y
    droppedPos?:string
}

interface WorkerData extends BaseData{
    //该 creep 的工作房间
    workRoom: string
}

interface TransporterData extends BaseData{
    //要使用的资源存放建筑 id
    sourceID?:Id<StructureWithStore>
    //该 creep 的工作房间
    //例如一个外矿搬运者需要知道自己的老家在哪里
    workRoom: string

    //取出目标
    from?:[number, number, string] | Id<StructureWithStore>
    //放入目标
    to?:[number, number, string] | Id<StructureWithStore>
    //能量类型
    resourceType?:ResourceConstant
    //结束条件（取出目标能量小于该值）
    endCondition?:number

    //当前执行的任务（临时字段）
    onWorkType?:AllTransportAction
}

interface CenterData  extends BaseData{
    x: number
    y: number
}
