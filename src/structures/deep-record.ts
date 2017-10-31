import * as deepmerge from 'deepmerge'

/*
import * as Reader from 'fp-ts/lib/Reader'
Reader.ask*/

type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>
}

interface _DeepRecord<T> {
  (partial?: DeepPartial<T>): T & _DeepRecord<T>
//set<K extends keyof T>(key: K, partial: T[K]): T & _DeepRecord<T>
}

type DeepRecord<T> = Readonly<T> & _DeepRecord<Readonly<T>>

function DeepRecord<T>(defaults: T): DeepRecord<T> {
  const merge = <DeepRecord<T>> function merge(partial: DeepPartial<T> = {}){
    return DeepRecord(deepmerge(defaults, partial))
  }
//merge.set = <K extends keyof T>(key: K, partial: T[K]) =>
//  DeepRecord(deepmerge(defaults, { [key]: partial }))
  return Object.assign(merge, defaults)
}

export { DeepRecord, DeepPartial }