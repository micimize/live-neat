import { Map as IMap, Record as IRecord } from 'immutable'
import * as t from 'io-ts'

/*
type NativeMap<K, V> = Map<K, V>
const NativeMap = Map
*/

function Enum(...literals){
  return t.union(Object.create(literals.map(s => t.literal(s))))
}

function emptyDefaults(props: t.Props){
  let o = {}
  Object.keys(props).forEach(k =>
    o[k] = undefined)
  return o
}

function subtractDefaults(props: t.Props, defaults: object){
  let defaultKeys = Object.keys(defaults)
  let o = {}
  Object.keys(props)
    .filter(k => defaultKeys.includes(k))
    .forEach(k => o[k] = props[k])
  return o
}

const IntegerKey: t.Type<number> = {
  _A: t._A,
  name: 'IntegerKey',
  validate(value, context){
    if (typeof value === 'string'){
      value = parseInt(value)
    }
    return t.Integer.validate(value, context)
  }
}
type KeyType = t.Type<string> | typeof IntegerKey

function Map<K extends KeyType, V extends t.Any >(keyType: K, valueType: V) {

  type Key = t.TypeOf<K>
  type Value = t.TypeOf<V>

  const Entries = t.array(t.tuple([ keyType, valueType ]))

  const MapType: t.Type<IMap<Key, Value>> = {
    _A: t._A,
    name: `Map<${keyType.name}, ${valueType.name}>'`,
    validate: (value: object, context) =>
      Entries.validate(Object.entries(value), context)
        .chain(entries => t.success(IMap<Key, Value>(entries)))
  }
  return MapType
}

function Record(props: t.Props, defaults = emptyDefaults(props)){
  defaults = t.validate(defaults, t.partial(props))

  let RequiredPartial = t.interface(subtractDefaults(props, defaults))
  type RequiredPartial = t.TypeOf<typeof RequiredPartial>

  let Interface = t.interface(props)
  type Interface = t.TypeOf<typeof Interface>

  class StrictRecord extends IRecord(defaults) implements Interface {
    constructor(
      record: RequiredPartial = defaults,
      fullRecord: Interface = Object.assign({}, defaults, record)
    ) {
      super(fullRecord)
    }
  }

  const StrictRecordT: t.Type<Interface> = {
    _A: t._A,
    name: 'StrictRecord',
    validate(value, context){
      return Interface.validate(new StrictRecord(value), context)
    }
  }
  return StrictRecordT
}

function InnovationMap(valueType: t.Any){
  return Map(IntegerKey, valueType)
}

const ActivationRef = Enum('INPUT', 'BIAS', 'sigmoid', 'tanh', 'relu')

const PotentialNode = t.interface({
  activation: t.number,
  type: Enum('INPUT', 'BIAS', 'OUTPUT', 'HIDDEN') // if no type then hidden
})

const PotentialConnection = t.interface({
  from: t.Integer,
  to: t.Integer,
})

const Context = Record({
  innovation: t.Integer,
  activations: InnovationMap(ActivationRef),
  nodes: InnovationMap(PotentialNode),
  connections: InnovationMap(PotentialConnection)
}, {
  innovation: 2,
  activations: { 0: 'INPUT', 1: 'BIAS' },
  nodes: {},
  connections: {}
})

let context = t.validate({ foo: 'bar' }, Context)

export { Enum, IntegerKey, Map, Record, t } 