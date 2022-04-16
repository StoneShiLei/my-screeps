
export default class SpawnTask<Role extends AllRoles = AllRoles>{
    /**
     * 要孵化的 creep 名称
     */
    name: string
    /**
     * 该 Creep 的角色
     */
    role: Role
    /**
     * 该creep的工作data
     */
    data:CreepData

    constructor(name:string,role:Role,data:CreepData){
        this.name = name
        this.role = role
        this.data = data
    }
}
