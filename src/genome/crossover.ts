import * as M from '@collectable/map';
import { unwrap } from '@collectable/core';
import { Crossover } from './functions'
import * as random from '../random-utils'
import { connectionExpressionTracker, select as selectGene } from './connection-gene'


type ConnectionMap = M.HashMapStructure<number, ConnectionGene>

function mix([ a, b ]: Array<ConnectionMap>): ConnectionMap {
  let [ longer, shorter ] = M.size(a) > M.size(b) ?
    [ a, b ] :
    [ b, a ]
  let total = Math.ceil(
    Math.min(M.size(a), M.size(b)) + Math.abs(M.size(a) - M.size(b)) / 2
  )
  return M.fromObject(Object.assign(
    random.subset(unwrap(longer), Math.ceil(total)),
    random.subset(unwrap(shorter), Math.floor(total))
  ))
}

interface Pool {
  shared: Genome,
  uniqueToA: Genome,
  uniqueToB: Genome
}

export function pools(a: Genome, b: Genome, { structuralSharing = true } = {}): Pool {
  let shared = {}
  let uniqueToA = clone(a)
  let uniqueToB = clone(b)
  let seen = connectionExpressionTracker()
  // First collect all shared innovations
  Object.keys(uniqueToA).forEach(innovation => {
    seen(uniqueToA[innovation])
    if(uniqueToB[innovation]){
      shared[innovation] = selectGene(uniqueToA[innovation], uniqueToB[innovation])
      delete uniqueToA[innovation]
      delete uniqueToB[innovation]
    }
  })
  // Then collect all structurally identical connections
  // A genome can't repeat the same connection, so only one pass is needed
  if (structuralSharing) {
    Object.keys(uniqueToB).forEach(innovation => {
      let previouslySeen = seen(uniqueToB[innovation])
      if (previouslySeen){
        if (uniqueToA[previouslySeen.innovation]){
          // structural sharing
          shared[innovation] = selectGene(previouslySeen, uniqueToB[innovation])
        }
        delete uniqueToA[previouslySeen.innovation]
        delete uniqueToB[innovation]
      }
    })
  }
  return { shared, uniqueToA,  uniqueToB }
}


export default function crossover(a: Genome, b: Genome) {
  let { shared, uniqueToA, uniqueToB } = pools(a, b)
  return Object.assign(shared, mix(uniqueToA, uniqueToB))
}


