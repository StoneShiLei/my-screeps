
export abstract class BaseManager{
    abstract tickStart():void
    abstract tickEnd():void
    run?(target:RunnerTarget):void
}
