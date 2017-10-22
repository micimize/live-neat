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
  innovation: 2,
  activations: Map<Integer, ActivationRef>([[ 0, 'INPUT' ], [ 1, 'BIAS' ]]),
  nodes: Map<Integer, PotentialNode>(),
  connections: Map<Integer, PotentialConnection>()
}

let record = Record(emptyContext)
let empty = record()

type InnovationContext = typeof empty

interface Constructor<T> {
  (partial: Partial<T>): T
  of(partial: Partial<T>): T
  empty(): T
}

function Constructor<T>(record, empty = {}): Constructor<T> {
  const C = <Constructor<T>> function (partial) {
    return record(partial)
  }
  C.of = C
  C.empty = () => C(empty)
  return C
}

const InnovationContext = Constructor<InnovationContext>(record, emptyContext)

export { InnovationContext, InnovationMap, PotentialConnection, PotentialNode }
