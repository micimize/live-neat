import { Record, Map } from 'immutable'

type Integer = number

type InnovationMap<V> = Map<Integer, V>

type ActivationRef = 'INPUT' | 'BIAS' | 'sigmoid' | 'tanh' | 'relu'

interface PotentialConnection {
  from: Integer,
  to: Integer,
}

interface PotentialNode {
  activation: number,
  type: 'INPUT' | 'BIAS' | 'OUTPUT' | 'HIDDEN' // if no type then hidden
}

interface ContextStructure {
  innovation: Integer
  activations: InnovationMap<ActivationRef>
  nodes: InnovationMap<PotentialNode>
  connections: InnovationMap<PotentialConnection>
}

const emptyContext = {
  innovation: 2,
  activations: Map<Integer, ActivationRef>([[ 0, 'INPUT' ], [ 1, 'BIAS' ]]),
  nodes: Map<Integer, PotentialNode>(),
  connections: Map<Integer, PotentialConnection>()
}

class Structure extends Record(emptyContext) implements ContextStructure {
  constructor(record: ContextStructure = emptyContext) {
    super(record)
  }
  static of(record: ContextStructure = emptyContext): Structure {
    return new Structure(record)
  }
  of = Structure.of
}

export default Structure