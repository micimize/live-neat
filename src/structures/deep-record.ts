import { deepmerge } from 'deepmerge'

type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>
}

type Mergeable<T> = T & {
  merge(partial: DeepPartial<T>): Mergeable<T>
}

type MR<T> = Mergeable<Readonly<T>>

interface _DeepRecord<T> {
  (partial?: DeepPartial<T>): T & _DeepRecord<T>
}

type DeepRecord<T> = Readonly<T> & _DeepRecord<Readonly<T>>

function DeepRecord<T>(_empty: T): DeepRecord<T> {
  let callable = <DeepRecord<T>> function merge(
    this: DeepRecord<T>,
    partial: DeepPartial<T>
  ): DeepRecord<T> {
    return deepmerge(this, partial)
  }
  return deepmerge(callable, _empty)
}

export { DeepRecord, DeepPartial }