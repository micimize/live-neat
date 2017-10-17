import { Record } from 'immutable'
import { Map, t, l } from '../structures'

function InnovationMap<V extends t.Any>(valueType: V){
  return Map(t.Integer, valueType)
}

const ActivationRef = t.union([l('INPUT'), l('BIAS'), l('sigmoid'), l('tanh'), l('relu')])

const PotentialConnection = t.interface({
  from: t.Integer,
  to: t.Integer,
})

const PotentialNode = t.interface({
  activation: t.number,
  type: t.union([l('INPUT'), l('BIAS'), l('OUTPUT'), l('HIDDEN')]) // if no type then hidden
})

const ContextStructure = t.interface({
  innovation: t.Integer,
  activations: InnovationMap(ActivationRef),
  nodes: InnovationMap(PotentialNode),
  connections: InnovationMap(PotentialConnection)
})

type ContextStructure = t.TypeOf<typeof ContextStructure>

const emptyContext = {
  innovation: 2,
  activations: Map.of([[ 0, 'INPUT' ], [ 1, 'BIAS' ]]),
  nodes: Map.of(),
  connections: Map.of()
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

let s = new Structure()

export default Structure