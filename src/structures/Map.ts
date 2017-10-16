import { Map as IMap } from 'immutable'
import * as t from 'io-ts'

const IntegerKey: t.Type<number> = {
  _A: t._A,
  name: 'IntegerKey',
  validate(value, context){
    if (typeof value === 'string'){
      value = parseInt(value)
    }
    return t.validate(value, t.Integer)
  }
}

const KeyTypes = t.union([t.string,  IntegerKey])

function IOMap(keyType: t.Any & t.TypeOf<typeof KeyTypes>, valueType: t.Any): t.Type<IMap<t.TypeOf<typeof keyType>, t.TypeOf<typeof valueType>>> {

  type Key = t.TypeOf<typeof keyType>
  type Value = t.TypeOf<typeof valueType>
  type MapType = t.Type<IMap<Key, Value>> 

  const Entries = t.array(t.tuple([ keyType, valueType ]))

  const MapType: t.Type<IMap<Key, Value>> = {
    _A: t._A,
    name: `Map<${keyType.name}, ${valueType.name}>'`,
    validate: (value: object, context) =>
      Entries.validate(Object.entries(value), context)
        .chain(entries => t.success(IMap<Key, Value>(entries)))
  }
}

/*
function StrictRecord(props: t.Props, defaults = emptyDefaults(props)){
  let Interface = t.interface(props)
  type R = t.TypeOf<typeof Interface>
  class StrictRecord extends IRecord(defaults) implements R {
    constructor(record: R = defaults) {
      t.validate(record, Interface)
      super(record)
    }
  }
  return StrictRecord
}

const Context = StrictRecord({
  innovation: t.number
  activations: Map<number, ActivationRef>
  nodes: Map<number, PotentialNode>
  connections: Map<number, PotentialConnection> 
}, {
  innovation: 2,
  activations: Map<number, ActivationRef>({ 0: 'INPUT', 1: 'BIAS' }),
  nodes: Map<number, PotentialNode>(),
  connections: Map<number, PotentialConnection>()
})
