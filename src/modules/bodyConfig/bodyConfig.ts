

const workerBodyConfig = {
    lowLevelWorkerBodyCalctor:function(room:Room){
        let totalEnergy = room.getEnergyCapacityAvailable()
        if(!room.creeps("worker").length) totalEnergy = room.getEnergyAvailable()

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
    }
}


export class BodyConfig{

    static workerBodyConfig = workerBodyConfig




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


    public static getPartCount(creep:Creep,body:BodyPartConstant){
        const name:BodyPartName = `${body}+` as BodyPartName
        if(!creep.memory.bodyParts) creep.memory.bodyParts = {}
        if(creep.memory.bodyParts[name]) return creep.memory.bodyParts[name]

        creep.memory.bodyParts[name] = creep.body.filter(part => part.type === body).length
        return creep.memory.bodyParts[name]
    }
}


