

type BodySet = {
    [MOVE]?: number
    [CARRY]?: number
    [ATTACK]?: number
    [RANGED_ATTACK]?: number
    [WORK]?: number
    [CLAIM]?: number
    [TOUGH]?: number
    [HEAL]?: number
} | [BodyPartConstant, number][];


interface CreepMemory{
    bodyParts?:BodyParts
}

type BodyPartName = 'move+' | 'work+' | 'carry+' | 'attack+' | 'ranged_attack+' | 'heal+' | 'claim+' | 'tough+';
type BodyParts = {
    'move+'?: number
    'work+'?: number
    'carry+'?: number
    'attack+'?: number
    'ranged_attack+'?: number
    'heal+'?: number
    'claim+'?: number
    'tough+'?: number
}


type BodyCalcFunc = (...args: any[])=>BodyPartConstant[]
