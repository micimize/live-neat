import Genome from '../genome'

type Weight = number

export type Range = [ number, number ] // [ start, end ]

export type Value = number | null

export interface Node {
  value: Value,
  from?: { [ nodeReference: number ]: Weight },
  activation: string
}

export interface NetworkData {
  nodeList: Array<Node>,
  ranges: { input: Range, output: Range } ,
}

export default interface Network extends NetworkData {
  genome: Genome,
  setInputs(inputs: Array<Value>): void,
  inputs: Array<Value>,
  outputs: Array<Value>,
  clear(): void,  
  forward(inputs: Array<Value>, count?: number): Array<Value>
}
