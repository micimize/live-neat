import * as t from 'io-ts'
import { ThrowReporter } from 'io-ts/lib/ThrowReporter'

const l = t.literal

function validater<I>(I){
  return obj => {
    let v = t.validate(obj, I)
    ThrowReporter.report(v)
    return v.value as I
  }
}

export { l, t, validater }