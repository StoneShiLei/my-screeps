
interface Flag{
    id: Id<Flag>;

    getPrefix():string | undefined

    getNameSplit():string[]

    getRoomName(index?:number):string | undefined

    getRoom(index?:number):Room | undefined
}
