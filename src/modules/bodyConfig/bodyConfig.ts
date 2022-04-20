

export class BodyConfig{



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
        const name:BodyPartName = `${body}+`
        if(creep.memory.bodyParts) creep.memory.bodyParts = {}
        if(creep.memory.bodyParts[name]) return creep.memory.bodyParts[name]

        creep.memory.bodyParts[name] = creep.body.filter(part => part.type === body).length
        return creep.memory.bodyParts[name]
    }
}
