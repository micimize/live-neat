import { Record, Map } from 'immutable'

type Integer = number

type InnovationMap<V> = Map<Integer, V>
function InnovationMap<V>(...args){
  return Map<Integer, V>(...args)
}

type ActivationRef = 'INPUT' | 'BIAS' | 'sigmoid' | 'tanh' | 'relu'

interface PotentialConnection {
  from: Integer,
  to: Integer,
}

interface PotentialNode {
  activation: number,
  type?: 'INPUT' | 'BIAS' | 'OUTPUT' | 'HIDDEN' // if no type then hidden
}

const emptyContext = {
  innovation: 1,
  activations: Map<Integer, ActivationRef>([[ 0, 'INPUT' ], [ 1, 'BIAS' ]]),
  nodes: Map<Integer, PotentialNode>(),
  connections: Map<Integer, PotentialConnection>()
}

let record = Record(emptyContext)
let emptyChronicle = record()

type Chronicle = typeof emptyChronicle

function Chronicle(partial: Partial<Chronicle> ={ }): Chronicle {
  return record(partial)
}

const factory = Chronicle

namespace Chronicle {
  export const of = factory 
  export function empty() {
    return factory(emptyChronicle)
  }
  export type Activation = ActivationRef
  export type Connection = PotentialConnection
  export type Node = PotentialNode

  export type Map<V> = InnovationMap<V>

  export const Map = InnovationMap
}

export { Chronicle, InnovationMap, PotentialConnection, PotentialNode }
