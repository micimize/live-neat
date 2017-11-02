import { Record } from 'immutable'

type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>
}

function shouldBeRecord(value): boolean {
  return (typeof value === 'object') &&
    !Array.isArray(value) &&
    !Record.isRecord(value)
}

function DeepRecord<T extends {}>(raw: T): Record.Factory<T> {
  for (let key in raw){
    let value = raw[key]
    if(shouldBeRecord(value)){
      raw[key] = DeepRecord(value)()
    }
  }
  return Record(raw)
}

export { DeepRecord, DeepPartial }