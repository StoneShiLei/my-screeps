
interface Room{
    _spawnMap?:SpawnMap
    _spawnQueue?:SpawnTask[]
    _currentEnergyAvailable:number
    _hiveEnergySending:number
    _hiveEnergySendingReg:HiveSendingReg
}

interface RoomMemory {
    _carryBusy:{[tick:number]:number}
}

type HiveSendingReg = {
    [key:string]:boolean
}
type SpawnMap = {
    [key:string]:boolean
}

interface SpawnTask {
    priority:number
    name:string
    role:Role
    tasks:Task[]
    spawnOptions:SpawnOptions
    bodyFunc:BodyCalcFunc
    bodyFuncArgs:BodyCalcFuncArgs
}

interface Game {
    _name_hash:number
}
