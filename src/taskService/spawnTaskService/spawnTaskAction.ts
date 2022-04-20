import { BaseTaskAction } from "taskService/baseTaskAction"
import { Singleton } from "typescript-ioc"

export type SpawnActionName = 'func1'

@Singleton
export class SpawnTaskAction extends BaseTaskAction {

    func1() {
        console.log('func1')
    }

    func2(){

    }

}
