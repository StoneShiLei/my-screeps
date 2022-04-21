
interface Creep {
    //阻塞锁  防止1tick多任务时进行无效的拿起和放下操作
    _moveResourceActive: boolean;
    _moveResourceActiveOK: boolean;

    //记录是否已填充过
    _fillActive:FillActive
}

type FillActive = {
    [key:string]:boolean
}


interface Room {
    _roomDropRegMap:{[key:string]:boolean}
}
