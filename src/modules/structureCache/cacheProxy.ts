
export class RoomCacheProxy extends Room{

    get<T extends CacheReturnType>(key:GetKey):T{
        //@ts-ignore
        return this[key]
    }

}



