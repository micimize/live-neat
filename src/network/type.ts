import Genome from '../genome'

type Weight = number

export type Range = [ number, number ] // [ start, end ]

export interface Node {
  value: number,
  from?: { [ nodeReference: number ]: Weight },
  activation?: string
}

export interface NetworkData {
  nodeList: Array<Node>,
  ranges: { input: Range, output: Range } ,
}

export default interface Network extends NetworkData {
  genome: Genome,
  setInputs(inputs: Array<number>): void,
  inputs: Array<number>,
  outputs: Array<number>,
  clear(): void,  
  forward(inputs: Array<number>, count?: number): Array<number>
}
