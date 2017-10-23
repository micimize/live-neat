import { Map } from 'immutable'
import { Record } from '../structures/Record'

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
  innovation: 2,
  activations: Map<Integer, ActivationRef>([[ 0, 'INPUT' ], [ 1, 'BIAS' ]]),
  nodes: Map<Integer, PotentialNode>(),
  connections: Map<Integer, PotentialConnection>()
}

const InnovationChronicle = Record(emptyContext)
let empty = InnovationChronicle.empty()
type InnovationChronicle = typeof empty

export { InnovationChronicle, InnovationMap, PotentialConnection, PotentialNode }
