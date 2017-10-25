import { Genome } from '../genome'

namespace Network {
  export type Weight = number
  export type NodeRange = [ number, number ] // [ start, end ]
  export type ActivationValue = number | null
  export interface Node {
    innovation: number,
    value: number | null,
    activation: string,
    from?: { [ nodeReference: number ]: Weight },
  }
  export interface ToNode extends Node {
    innovation: number,
    value: number | null,
    activation: string,
    from: { [ nodeReference: number ]: Weight },
  }
  export interface Data {
    nodeList: Array<Node>,
    ranges: { input: NodeRange, output: NodeRange } ,
  }
}

interface Network extends Network.Data {
  genome: Genome,
  setInputs(inputs: Array<Network.ActivationValue>): void,
  inputs: Array<Network.ActivationValue>,
  outputs: Array<Network.ActivationValue>,
  clear(): void,  
  forward(inputs: Array<Network.ActivationValue>, count?: number): Array<Network.ActivationValue>
}


export { Network }