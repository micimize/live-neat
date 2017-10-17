import * as I from 'immutable'
import { l, t, validater } from './t'

type Defaults<P extends t.Props> = t.PartialOf<P> 
function emptyDefaults<P extends t.Props>(props: P): Defaults<P> {
  let o = {}
  Object.keys(props).forEach(k =>
    o[k] = undefined)
  return o as Defaults<P>
}

// Prefilled Records don't require full or any arguments, as the defaults already satisfy them
function PrefilledRecord<P extends t.Props>(props: P, defaults: t.TypeOf<typeof FullInterface>){
  let FullInterface = t.interface(props)
  type Interface = t.TypeOf<typeof FullInterface>
  let R = I.Record(defaults as Object)
  class PrefilledRecord extends R {
    constructor(record: Partial<Interface> = defaults) {
      super(record)
    }
    static of(record: Partial<Interface> = defaults): PrefilledRecord {
      return new PrefilledRecord(record)
    }
  }
  return PrefilledRecord
}

function Record<P extends t.Props>(props: P, defaults: Defaults<P> = emptyDefaults(props)){
  let FullInterface = t.readonly(t.interface(props))
  type Interface = t.TypeOf<typeof FullInterface>
  let D = t.partial(props)
  let validate = validater<Interface>(FullInterface)
  class StrictRecord extends I.Record(defaults as object) {
    constructor(record: Interface) {
      super(validate(record))
    }
    static of(record: Interface): StrictRecord {
      return new StrictRecord(record)
    }
    public of = (record: Interface) => StrictRecord.of(record)
  }
  return StrictRecord
}

export { Record, PrefilledRecord }
