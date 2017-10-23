import { Record as IRecord } from 'immutable'

interface Constructor<T> {
  (partial: Partial<T>): T
  of(partial: Partial<T>): T
  empty(): T
}

function Constructor<T>(record, empty = {}): Constructor<T> {
  const C = <Constructor<T>> function (partial) {
    return record(partial)
  }
  C.of = C
  C.empty = () => C(empty)
  return C
}

function Record<T>(defaults: T, empty = defaults): Constructor<T> {
  let record = IRecord(defaults)
  let _empty = record(empty)
  type Rec = typeof _empty
  return Constructor<Rec>(record, empty)
}

export { Record }