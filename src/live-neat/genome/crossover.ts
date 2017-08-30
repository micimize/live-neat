import Genome from './type'
import * as random from '../../random-utils'
import { connectionExpressionTracker, select as selectGene } from './connection-gene'

function mix(a: Genome, b: Genome) {
  let aLength = Object.keys(a).length
  let bLength = Object.keys(b).length
  let [ longer, shorter ] = aLength > bLength ?
    [ a, b ] :
    [ b, a ] :
  let total = Math.ceil(
    Math.min(aLength, bLength) + Math.abs(aLength - bLength) / 2
  )
  return Object.assign(
    random.subset(longer, Math.ceil(total)),
    random.subset(shorter, Math.floor(total))
  )
}

interface Pool {
  shared: Genome,
  uniqueToA: Genome,
  uniqueToB: Genome
}

export function pools(a: Genome, b: Genome, { structuralSharing = false }): Pool {
  let shared = {}
  let uniqueToA = Object.assign({}, a)
  let uniqueToB = Object.assign({}, b)
  let seen = connectionExpressionTracker()
  // First collect all shared innovations
  Object.keys(uniqueToA).forEach(innovation => {
    seen(innovation)
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
  return Object.assign(shared, mix(uniqueToA, uniqueToB)))
}


