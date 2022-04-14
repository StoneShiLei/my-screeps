
export default class CreepExtension extends Creep {

    public getEngryFrom(target: AllEnergySource): ScreepsReturnCode {
        let result: ScreepsReturnCode
        // 是建筑 或者遗迹 就用 withdraw
        if (target instanceof Ruin || target instanceof Structure || target instanceof Tombstone) {
            // 如果建筑里没能量了就不去了，防止出现粘性
            if ((target instanceof Structure || target instanceof Ruin ) && target.store[RESOURCE_ENERGY] <= 0) return ERR_NOT_ENOUGH_ENERGY
            else if(target instanceof Ruin)result = this.withdraw(target as Ruin, RESOURCE_ENERGY)
            else if(target instanceof Tombstone)result = this.withdraw(target as Tombstone, RESOURCE_ENERGY)
            else if(target instanceof Structure)result = this.withdraw(target as Structure, RESOURCE_ENERGY)
            else return ERR_INVALID_TARGET
        }
        else if (target instanceof Resource) result = this.pickup(target as Resource)
        // 不是的话就用 harvest
        else result = this.harvest(target as Source)

        if (result === ERR_NOT_IN_RANGE) this.goTo(target.pos)

        return result
    }
}
