import BodyAutoConfig from 'modules/bodyConfig/bodyConfig';
import Test2 from './test2';

const roles = {
    upgrader: Test2
}

// type BodyConfig1 = {
//     [energyLevel in "300" | "550" | "800" | "1300" | "1800" | "2300" | "5600" | "10000" ]: BodyPartConstant[]
// }

// type EnergyyLevel =

// function getBodyConfig(...bodySets: [ BodySet, BodySet, BodySet, BodySet, BodySet, BodySet, BodySet, BodySet]): BodyConfig {
//     let config:BodyConfig1 = { "300": [], "550": [], "800": [], "1300": [], "1800": [], "2300": [], "5600": [], "10000": [] }
//     // 遍历空配置项，用传入的 bodySet 依次生成配置项
//     Object.keys(config).map((level, index) => {
//         config[level as keyof BodyConfig1] = BodyAutoConfig.calcBodyPart(bodySets[index])
//     })
//     return config
// }


function testFunc ():String | Number{
    return "1"
}

let result = testFunc()
if(result instanceof String ){
    console.log(result)
}else if(result instanceof Number){
    console.log(result)
}
