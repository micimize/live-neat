import * as t from 'io-ts'
import { URI, SortedSet } from './types'

const set = fromArray(['X', 'Y']); // => <[X, Y]>
const array = Array.from(set); // => [X, Y]

function comparator<A>(attr: string){
  return (a: A, b: A) => Number(a[attr]) - Number(b[attr])
}

class sSpecies extends SortedSet<Creature> {
  _URI = '@species',
  comparator: comparator<Creature>('fitness')

}

function serializable({ name, Type, validate }): t.Type<object> {
  return {
    _A: t._A,
    name,
    validate(value, context){
      let [ [ key, values ] ] = Object.entries(value)
      if(key == name && validate(values){
        return Type.of(values)
      }
    }
  }
}

const sortedSet: t.Type<object> = {
  _A: t._A,
  name: URI,
  validate: (value, context) => {
    let [ [ key, values ] ] = Object.entries(value)
    if(key)
(Array,isArray(value) ? t.success(value) : t.failure<string>(value, context))
  }
}
