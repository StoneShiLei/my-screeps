declare namespace NodeJS {
  interface Global {

  }
}

interface CreepMemory {
  role: string;
  room?: string;
  working: boolean;
}

interface Memory {
  uuid: number;
  log: any;
}

type AnyObject = { [key: string]: any }

type Colors = 'green' | 'blue' | 'yellow' | 'red'
