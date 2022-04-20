declare namespace NodeJS {
  interface Global {
    memory?:Memory
  }
}

declare module "watch-client"


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



