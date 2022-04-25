
export class FlagExtension extends Flag{

    idGetter():Id<Flag>{
        const flagId = this.name as Id<Flag>
        return flagId
    }

    getPrefix():string | undefined{
        let strLs = this.name.split('_')
        return strLs.length >= 1 ? strLs[0] : undefined
    }

    getNameSplit():string[]{
        return this.name.split("_")
    }

    getRoomName(index:number = 1):string | undefined{
        let strLs = this.name.split('_')
        return strLs.length >= 2 ? strLs[index] : undefined
    }

    getRoom(index:number = 1):Room | undefined{
        const roomName = this.getRoomName(index)
        return roomName ? Game.rooms[roomName] : undefined
    }
}
