import { deepmerge } from 'deepmerge'

type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>
}

type Ofable<T> = T & {
  of(partial: DeepPartial<T>): Ofable<T>
}

type RO<T> = Ofable<Readonly<T>>

interface DeepRecord<T> {
  (partial?: DeepPartial<T>): T
  of(partial: DeepPartial<T>): T
  empty(): T
}

function DeepRecord<T>(_empty: T): DeepRecord<RO<T>> {
  const empty: RO<T> = Object.assign({}, _empty, {
    of(partial: DeepPartial<T>): RO<T> {
      return deepmerge(this, partial)
    }
  })
  const C = <DeepRecord<RO<T>>> function DeepRecord(partial: DeepPartial<T> = {}) {
    return deepmerge(empty, partial)
  }
  C.of = C
  C.empty = () => C()
  return C
}

export { DeepRecord }