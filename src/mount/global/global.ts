import { StackAnalysis } from "modules/stackAnalysis/StackAnalysis";


const globalExtension = {
    StackAnalysis,
    get:Game.getObjectById
}


export default function(){
    _.assign(global,globalExtension)
}
