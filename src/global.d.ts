
export interface InnovationMap<T> {
  [innovation: number]: T }

export interface Innovation {
  innovation: number
}

export interface PotentialNode {
  activation: number,
  type?: 'INPUT' | 'BIAS' | 'OUTPUT' | 'HIDDEN' // if no type then hidden
}

export interface PotentialConnection {
  from: number,
  to: number
} 

type ConnectionInnovation = PotentialConnection | Innovation

export interface ConnectionGene extends ConnectionInnovation {
  weight: number,
  active: boolean
}

type Genome = InnovationMap<ConnectionGene>

/* * * * * *
 * networks
 */
type Weight = number

export type Range = [ number, number ] // [ start, end ]

export interface Node {
  id: number,
  value: number | null,
  from?: { [ nodeReference: number ]: Weight },
  activation: string
}

export interface NetworkData {
  nodeList: Array<Node> | { toJSON(): string },
  ranges: { input: Range, output: Range } ,
}

export interface Network extends NetworkData {
  genome: Genome,
  setInputs(inputs: Array<Value>): void,
  inputs: Array<Value>,
  outputs: Array<Value>,
  clear(): void,  
  forward(inputs: Array<Value>, count?: number): Array<Value>
}

