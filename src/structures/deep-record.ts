import * as deepmerge from 'deepmerge'


/*
import * as Reader from 'fp-ts/lib/Reader'
Reader.ask*/

type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>
}

interface _DeepRecord<T> {
  (partial?: DeepPartial<T>): T & _DeepRecord<T>,
//set<K extends keyof T>(key: K, partial: T[K]): T & _DeepRecord<T>
}

type DeepRecord<T> = Readonly<T> & _DeepRecord<Readonly<T>>

function deepMerge<O, P extends DeepPartial<O>>(o: O, p: P): O {
  return Object.keys(p).reduce((merged, key) => {
    let type = typeof(o[key])
    if(type === 'function'){
      merged[key] = o[key](p[key])
    } else if(type === 'object' && !Array.isArray(o[key])){
      merged[key] = deepMerge(o[key], p[key])
    } else if (p[key] !== undefined) {
      merged[key] = p[key]
    }
    return merged
  }, Object.assign({}, o)) as O
}

function DeepRecord<T>(defaults: T): DeepRecord<T> {
  const merge = <DeepRecord<T>> function merge(partial: DeepPartial<T> = {}){
    return DeepRecord(deepMerge(defaults, partial))
  }
//merge.set = <K extends keyof T>(key: K, partial: T[K]) =>
//  DeepRecord(deepmerge(defaults, { [key]: partial }))
  return Object.assign(merge, defaults)
}

export { DeepRecord, DeepPartial }