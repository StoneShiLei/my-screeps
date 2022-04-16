declare namespace NodeJS {
  interface Global {
    memory?:Memory
  }
}

declare module "movement" {
  export function prepare(): void;
  export function process(): void;
}

declare module "superMove" {
  export function deletePathInRoom(roomName:string):void
}

declare module "watch-client"


interface RoomObject{
  onWork?():void
}

type AnyObject = { [key: string]: any }

type Colors = GREEN | BLUE | YELLOW | RED
type GREEN = 'green'
type BLUE = 'blue'
type YELLOW = 'yellow'
type RED = 'red'

type StructureWithStore =
 StructureTower |
 StructureStorage |
 StructureContainer |
 StructureExtension |
 StructureFactory |
 StructureSpawn |
 StructurePowerSpawn |
 StructureLink |
 StructureTerminal |
 StructureNuker



