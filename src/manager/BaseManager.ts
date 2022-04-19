
export abstract class BaseManager{
    abstract tickStart():void
    abstract tickEnd():void
    abstract run(target:RunnerTarget):void
}
