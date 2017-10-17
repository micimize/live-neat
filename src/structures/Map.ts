import * as I from 'immutable'
import { l, t, validater } from './t'

function IOMap<K extends t.Any, V extends t.Any>(keyType: K, valueType: V) {

  type Key = t.TypeOf<K>
  type Value = t.TypeOf<V>
  type M = I.Map<Key, Value>

  const Entries = t.array(t.tuple([ keyType, valueType ]))
  type Entries = t.TypeOf<typeof Entries>

  type Type = t.Type<M> & {
    of: (value: Entries) => M
  }

  const Type: Type = {
    _A: t._A,
    name: `Map<${keyType.name}, ${valueType.name}>'`,
    validate: (value: object, context) =>
      Entries.validate(Object.entries(value), context)
        .chain(entries => t.success(I.Map<Key, Value>(entries))),
    of: (entries: Entries): M => I.Map<Key, Value>(entries)
  }

  return Type //{ Map, Type }

}
namespace IOMap {
    export const of = I.Map.of
    export const isMap = I.Map.of
}

export default IOMap
