
export default class ControllerExtension extends StructureController{

    onWork(): void {

        if(Game.time%20) return

        if(!this.room.memory.transporterNum) this.room.memory.transporterNum = 0
        if(!this.room.memory.workerNum) this.room.memory.workerNum = 0

        this.room.memory.transporterNum = this.room.find(FIND_MY_CREEPS,{filter:c=>c.memory.role === 'transporter'}).length
        this.room.memory.workerNum = this.room.find(FIND_MY_CREEPS,{filter:c=>c.memory.role === 'worker'}).length

        if(this.checkLevelChange()) this.onLevelChange(this.level)
    }

    checkLevelChange():boolean{
        if(!this.room.memory.controllerLevel) this.room.memory.controllerLevel = 0

        let hasLevelChange = false
        hasLevelChange = this.room.memory.controllerLevel !== this.level
        this.room.memory.controllerLevel = this.level

        return hasLevelChange
    }

    onLevelChange(level:number){
        if(level === 1){
            this.room.spawnController.releaser.releaseHarvester()
            this.room.spawnController.releaser.releaseBaseUnit('transporter',1)
            this.room.spawnController.releaser.releaseBaseUnit('worker',2)
        }
    }
}
