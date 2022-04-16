interface Room{
    sources?:Source[] //room的source列表


}

interface RoomMemory {

    transporterNum:number
    workerNum:number
}

type BaseUnits = Worker | Transporter
