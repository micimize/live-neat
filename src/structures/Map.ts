import * as I from 'immutable'
import * as t from 'io-ts'
let l = t.literal

type Defaults<P extends t.Props> = t.PartialOf<P>

function emptyDefaults<P extends t.Props>(props: P): Defaults<P> {
  let o = {}
  Object.keys(props).forEach(k =>
    o[k] = undefined)
  return o as Defaults<P>
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

  const MapType: t.Type<I.Map<Key, Value>> = {
    _A: t._A,
    name: `Map<${keyType.name}, ${valueType.name}>'`,
    validate: (value: object, context) =>
      Entries.validate(Object.entries(value), context)
        .chain(entries => t.success(I.Map<Key, Value>(entries)))
  }
  return MapType
}

function IRecord<I extends {}>(defaults: Partial<I>){
  let R = I.Record(defaults as object)
  class StrictRecord extends R {
    constructor(record: I): Readonly<I> & typeof R {
      super(record)
    }
    static of(record: I): StrictRecord {
      return new StrictRecord(record)
    }
    readonly of = StrictRecord.of
  }
  return StrictRecord
}

function Record<P extends t.Props>(props: P, defaults: Defaults<P> = emptyDefaults(props)){
  let FullInterface = t.readonly(t.interface(props))
  type Interface = t.TypeOf<typeof FullInterface>
  return IRecord<Interface>(defaults as object)
}

function InnovationMap(valueType: t.Any){
  return Map(IntegerKey, valueType)
}

//let t = t.union([t.literal('INPUT')]
const ActivationRef = t.union([l('INPUT'), l('BIAS'), l('sigmoid'), l('tanh'), l('relu')])

const PotentialNode = t.interface({
  activation: t.number,
  type: t.union([l('INPUT'), l('BIAS'), l('OUTPUT'), l('HIDDEN')]) // if no type then hidden
})

const PotentialConnection = t.interface({
  from: t.Integer,
  to: t.Integer,
})

const Activations= InnovationMap(ActivationRef)
let a: t.TypeOf<typeof Activations> = t.validate([[ 0, 'INPUT', 1, 'BIAS' ]], Activations)

const Context = Record({
  innovation: t.Integer,
  activations: InnovationMap(ActivationRef),
  nodes: InnovationMap(PotentialNode),
  connections: InnovationMap(PotentialConnection)
}, {
  innovation: 2,
  activations: InnovationMap(ActivationRef)([[ 0: 'INPUT', 1: 'BIAS' ]]),
  nodes: new I.Map>{},
  connections: {}
})
type Ct = t.TypeOf<typeof Context>

let context = new Context({ foo: 'bar' })
type C = typeof context

//type C = t.TypeOf<typeof context>

export { IntegerKey, Map, Record, t } 