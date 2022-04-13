declare namespace NodeJS {
  interface Global {

  }
}

interface Memory {
  uuid: number;
  log: any;
}

type AnyObject = { [key: string]: any }

type Colors = 'green' | 'blue' | 'yellow' | 'red'
