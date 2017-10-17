/*
declare interface InnovationMap<T> {
  [innovation: number]: T }

declare interface Innovation {
  innovation: number
}

declare interface PotentialNode {
  activation: number,
  type?: 'INPUT' | 'BIAS' | 'OUTPUT' | 'HIDDEN' // if no type then hidden
}

declare interface PotentialConnection {
  from: number,
  to: number
} 

type ConnectionInnovation = PotentialConnection & Innovation

declare interface ConnectionGene extends ConnectionInnovation {
  weight: number,
  active: boolean
}

type Genome = InnovationMap<ConnectionGene>
*/

/* * * * * *
 * networks
 */
type Weight = number

declare type NodeRange = [ number, number ] // [ start, end ]

declare type ActivationValue = number | null

declare interface NNode {
  id: number,
  value: number | null,
  activation: string,
  from?: { [ nodeReference: number ]: Weight },
}

declare interface NetworkData {
  nodeList: Array<NNode>,
  ranges: { input: NodeRange, output: NodeRange } ,
}

declare interface Network extends NetworkData {
  genome: Genome,
  setInputs(inputs: Array<ActivationValue>): void,
  inputs: Array<ActivationValue>,
  outputs: Array<ActivationValue>,
  clear(): void,  
  forward(inputs: Array<ActivationValue>, count?: number): Array<ActivationValue>
}

