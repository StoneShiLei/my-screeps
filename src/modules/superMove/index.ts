export function superMoveJS():any{
    return require('superMove')
}

export const superMove = {
    deletePathInRoom:function (roomName:string):void{
        superMoveJS().deletePathInRoom(roomName)
    },

    getAvoidRoomsMap:function():{[key:string]:number} {
        return superMoveJS().getAvoidRoomsMap()
    }
}
