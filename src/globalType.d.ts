declare namespace NodeJS {
  interface Global {

  }
}

declare module "movement" {
  export function prepare(): void;
  export function process(): void;
}

declare module "watch-client"

interface Memory {
  uuid: number;
  log: any;
}

type AnyObject = { [key: string]: any }

type Colors = 'green' | 'blue' | 'yellow' | 'red'

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



