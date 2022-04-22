import { Data } from "taskService";


declare global {
   export type BodySet = {
        [MOVE]?: number
        [CARRY]?: number
        [ATTACK]?: number
        [RANGED_ATTACK]?: number
        [WORK]?: number
        [CLAIM]?: number
        [TOUGH]?: number
        [HEAL]?: number
    } | [BodyPartConstant, number][];


    export  interface CreepMemory{
        bodyParts?:BodyParts
    }

    export  type BodyPartName = 'move+' | 'work+' | 'carry+' | 'attack+' | 'ranged_attack+' | 'heal+' | 'claim+' | 'tough+';
    export  type BodyParts = {
        'move+'?: number
        'work+'?: number
        'carry+'?: number
        'attack+'?: number
        'ranged_attack+'?: number
        'heal+'?: number
        'claim+'?: number
        'tough+'?: number
    }


    export  type BodyCalcFunc = (args:BodyCalcFuncArgs)=>BodyPartConstant[]
    export  interface BodyCalcFuncArgs {
        spawnRoom?:Room
        workRoom?:Room
        energy?:number
        isOutRoom?:boolean
        level?:number
        data?:Data
    }
}
