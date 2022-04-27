import { sa } from "modules/stackAnalysis/StackAnalysis";

const outerMaxPartCount = 3;
const innerMaxPartCount = 3;



type BodyConfigCalctor = {[key:string]:(args:BodyCalcFuncArgs)=>BodyPartConstant[]}
const workerBodyConfig:BodyConfigCalctor = {
    lowLevelWorkerBodyCalctor:function(args:BodyCalcFuncArgs):BodyPartConstant[]{
        if(!args || !args.spawnRoom) throw new Error("args.spawnRoom is null")
        const room = args.spawnRoom
        let totalEnergy = room.getEnergyCapacityAvailable()
        if(room.creeps("worker").length < 2) totalEnergy = room.getEnergyAvailable()

        let body = [WORK,CARRY,MOVE,MOVE]
        let bodyEnergy = BodyConfig.getBodyCosts(body)
        let out:BodyPartConstant[] = []
        let count = 0;
        for(let i=1; i*bodyEnergy<=totalEnergy; i++){
            out = out.concat(body)
            count += 1
            if(count >= 12) break
        }
        return out;
    },
    middleLevelWorkerBodyCalctor:function(args:BodyCalcFuncArgs):BodyPartConstant[]{
        if(!args || !args.spawnRoom) throw new Error("args.spawnRoom is null")
        const room = args.spawnRoom
        let totalEnergy = room.getEnergyCapacityAvailable()
        if(room.creeps("worker",false).length + room.creeps("transporter",false).length < 2) totalEnergy = room.getEnergyAvailable()

        let body = [WORK,CARRY,MOVE]
        let bodyEnergy = BodyConfig.getBodyCosts(body)
        let count = 0;
        for(let i=1; i*bodyEnergy<=totalEnergy; i++){
            if(count >= 12) break
            count += 1
        }
        return BodyConfig.calcBodyParts({work:count < 17 ? count : count - 1,carry: count, move: count});
    },
    highLevelWorkerBodyCalctor:function(args:BodyCalcFuncArgs):BodyPartConstant[]{
        if(!args || !args.spawnRoom) throw new Error("args.spawnRoom is null")
        const room = args.spawnRoom
        let totalEnergy = room.getEnergyCapacityAvailable()
        let body = BodyConfig.calcBodyParts({work:30,carry:10,move:10})
        if(room.creeps("worker",false).length + room.creeps("transporter",false).length < 2 || BodyConfig.getBodyCosts(body) > totalEnergy){
            return workerBodyConfig.middleLevelWorkerBodyCalctor(args)
        }
        return body
    }
}

const harvesterBodyConfig:BodyConfigCalctor = {

    harvesterBodyCalctor:function(args:BodyCalcFuncArgs):BodyPartConstant[]{
        const isOutRoom = args.isOutRoom
        const energy = args.energy
        // const level = args.level
        // const data = args.data
        if(isOutRoom === undefined || !energy) throw new Error("args is error")


        const maxPart =  isOutRoom ? outerMaxPartCount : innerMaxPartCount
        let current = 0
        let cost = BodyConfig.getBodyCosts([WORK,WORK,MOVE])
        let num = 0
        while(current + cost <= energy - BODYPART_COST[CARRY] * Math.ceil(num/5)){
            num += 1
            current += cost
            if(num >= maxPart) break;
        }
        let carrCount = Math.min(2,Math.ceil(num/5))
        if(num > 10 && num === innerMaxPartCount) carrCount = Math.min(8,50 - num*3)
        return BodyConfig.calcBodyParts({work:num * 2,carry:carrCount,move:num});
    },

    outterTransporterBodyCalctor:function(args:BodyCalcFuncArgs):BodyPartConstant[]{
        const energy = args.energy
        const maxPart = args.maxPart
        if(!energy) throw new Error("args.energy is undefinded")
        if(!maxPart) throw new Error("args.maxPart is undefinded")

        let current = 0
        let cost = BodyConfig.getBodyCosts([CARRY,CARRY,MOVE])
        let baseCost = BodyConfig.getBodyCosts([WORK,MOVE])
        let num = 0
        while(current + cost <= energy - baseCost){
            num += 1
            current += cost
            if(num >= 17 || maxPart / 2 < num) break
        }
        return BodyConfig.calcBodyParts({carry:num < 17 ? num * 2 : num * 2 - 1,move:num})
    },

    outterBuildTransporterBodyCalctor:function(args:BodyCalcFuncArgs):BodyPartConstant[]{
        const energy = args.energy
        const maxPart = args.maxPart
        if(!energy) throw new Error("args.energy is undefinded")
        if(!maxPart) throw new Error("args.maxPart is undefinded")

        let current = 0
        let cost = BodyConfig.getBodyCosts([CARRY,CARRY,MOVE])
        let baseCost = BodyConfig.getBodyCosts([WORK,MOVE])
        let num = 0
        while(current + cost <= energy - baseCost){
            num += 1
            current += cost
            if(num >= 17 || maxPart / 2 < num) break
        }
        return BodyConfig.calcBodyParts({carry:(num < 17 ? num * 2 : num * 2 - 1) - 2,move:num,work:2})
    },

    outterHarDefenseBodyCalctor:function(args:BodyCalcFuncArgs):BodyPartConstant[]{
        return BodyConfig.calcBodyParts({attack:4,ranged_attack:1,heal:1,move:10})
    },

    outterReverserBodyCalctor:function(args:BodyCalcFuncArgs):BodyPartConstant[]{
        const energy = args.energy
        if(!energy) throw new Error("args.energy is undefinded")

        let current = 0
        let cost = BodyConfig.getBodyCosts([CLAIM,MOVE])
        let num = 0
        while(current + cost <= energy){
            num += 1
            current += cost
            if(num >= 8) break
        }
        return BodyConfig.calcBodyParts({claim:num,move:num})
    },
}

const transporterBodyConfig:BodyConfigCalctor = {
    transporterBodyCalctor:function(args:BodyCalcFuncArgs):BodyPartConstant[]{
        const room = args.spawnRoom
        if(!room) throw new Error("args.spawnRoom is null")

        const totalEnergy = room.getEnergyCapacityAvailable()
        let body = [CARRY,CARRY,MOVE]
        let bodyEnergy = BodyConfig.getBodyCosts(body)
        let num = 0
        for(let i=1;i*bodyEnergy <= totalEnergy;i++){
            if(num >= 17) break
            num += 1
        }
        return BodyConfig.calcBodyParts({carry:num<17 ? num*2 : num*2-1,move:num});
    }
}

const upgraderBodyConfig:BodyConfigCalctor = {
    lowLevelUpgraderBodyCalctor:function(args:BodyCalcFuncArgs):BodyPartConstant[]{
        const room = args.spawnRoom
        if(!room) throw new Error("args.spawnRoom is null")

        let current = 0;
        let cost = BodyConfig.getBodyCosts([WORK,WORK,MOVE])
        let num = 0
        let energy = room.getEnergyCapacityAvailable()
        while(current + cost <= energy - BODYPART_COST[CARRY] * Math.ceil(num/5)){ // 超过 10个 work 加一个 carry
            num += 1
            current += cost
            if(num >= 16) break;
        }

        let is16 = 0
        if(num === 16){
            num -= 1;
            is16 = 2;
        }
        return BodyConfig.calcBodyParts({work:num * 2,carry:Math.ceil(num/5) + is16 ,move:num});
    }
}

const defenseBodyConfig:BodyConfigCalctor = {
    lowLevelDefenserBodyCalctor:function(args:BodyCalcFuncArgs):BodyPartConstant[]{
        const energy = args.energy
        if(!energy) throw new Error("args.energy is null")

        const attackCost = BodyConfig.getBodyCosts([ATTACK,ATTACK,ATTACK,MOVE])
        const count = Math.floor(energy / attackCost)
        return BodyConfig.calcBodyParts({move:count * 3,attack:count});
    }
}

const mineralBodyConfig:BodyConfigCalctor = {
    harvesterBodyCalctor:function(args:BodyCalcFuncArgs):BodyPartConstant[]{
        const energy = args.energy
        if(!energy) throw new Error("args.energy is null")

        if(!energy) throw new Error("args is error")


        let current = 0
        let cost = BodyConfig.getBodyCosts([WORK,WORK,WORK,WORK,MOVE])
        let num = 0
        while(current + cost <= energy){
            num += 1
            current += cost
            if(num >= 10) break;
        }
        return BodyConfig.calcBodyParts({work:num * 4,move:num});
    }
}

export class BodyConfig{

    static workerBodyConfig:BodyConfigCalctor = workerBodyConfig
    static harvesterBodyConfig:BodyConfigCalctor = harvesterBodyConfig
    static upgraderBodyConfig:BodyConfigCalctor = upgraderBodyConfig
    static transporterBodyConfig:BodyConfigCalctor = transporterBodyConfig
    static defenseBodyConfig:BodyConfigCalctor = defenseBodyConfig
    static mineralBodyConfig:BodyConfigCalctor = mineralBodyConfig


    public static getBodyCosts(body:BodyPartConstant[]){
        let need = 0
        body.forEach(part => {
            if(BODYPART_COST[part]){
                need += BODYPART_COST[part]
            }
        })
        return need
    }

    public static calcBodyParts(bodySet:BodySet):BodyPartConstant[]{
        if('length' in bodySet){
            let ls:BodyPartConstant[] = []
            bodySet.forEach(bodyTuple =>{
                for(let i=0;i<bodyTuple[1];i++){
                    ls.push(bodyTuple[0])
                }
            })
            return ls;
        }
        else{
            const bodys = Object.keys(bodySet).map(type => Array(bodySet[type as keyof BodySet]).fill(type))
            const result:BodyPartConstant[] = []
            return result.concat(...bodys)
        }
    }


    public static getPartCount(creep:Creep | null | undefined,body:BodyPartConstant):number{
        if(!creep || !body) return 0
        const name:BodyPartName = `${body}+` as BodyPartName
        if(!creep.memory.bodyParts) creep.memory.bodyParts = {}
        let parts = creep.memory.bodyParts[name]
        if(parts) return parts

        parts = creep.body.filter(part => part.type === body).length
        return parts
    }
}


