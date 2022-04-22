
import { Singleton } from "typescript-ioc";
import { BaseTaskAction } from "./baseTaskAction";

@Singleton
export abstract class BaseTaskService{
    abstract actions:BaseTaskAction


}
