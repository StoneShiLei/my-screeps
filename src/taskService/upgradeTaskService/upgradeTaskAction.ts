import { BaseTaskAction } from "taskService/baseTaskAction"
import { Singleton } from "typescript-ioc"

export type UpgradeActionName = 'func1'

@Singleton
export class UpgradeTaskAction extends BaseTaskAction {

    func1() {
        console.log('func1')
    }


}
