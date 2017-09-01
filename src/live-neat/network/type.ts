type Weight = number

export type Range = [ number, number ] // [ start, end ]

export interface Node {
  value: number,
  from?: { [ nodeReference: number ]: Weight },
  activate?: Function
}

export interface NetworkData {
  nodeList: Array<Node>,
  ranges: { input: Range, output: Range } ,
}

export default interface Network extends NetworkData {
  setInputs: (inputs: Array): void,
  getOutputs: (): Array,
  forward: (inputs: Array, count?: number): Array
}
