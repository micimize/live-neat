import InnovationContext, { InnovationMap } from './innovation-context'
import { choose, shuffle } from '../utils'
import { ConnectionGene, signature, connectionExpressionTracker, initializeConnection, select as selectGene } from './connection-gene'


export const RawGenome = InnovationMap<ConnectionGene>


function randomObjSlice(obj: object, count: number) {
  return shuffle(Object.keys(obj)).slice(0, count).reduce((sub, key) =>
    sub[key] = obj[key], sub
  ), {})
}


function mix(a: RawGenome, b: RawGenome) {
  let aLength = Object.keys(a).length
  let bLength = Object.keys(b).length
  let [ longer, shorter ] = aLength > bLength ?
    [ a, b ] :
    [ b, a ] :
  let total = Math.ceil(
    Math.min(aLength, bLength) + Math.abs(aLength - bLength) / 2
  )
  return Object.assign(
    randomObjSlice(longer, Math.ceil(total)),
    randomObjSlice(shorter, Math.floor(total))
  )
}


export function pools(a: RawGenome, b: RawGenome, { structuralSharing = false }: { structuralSharing: boolean }): { shared: RawGenome, uniqueToA: RawGenome, uniqueToB: RawGenome } {
  // collects all genes that share innovation number or connection signature in shared
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


export function crossover(a: RawGenome, b: RawGenome) {
  let { shared, uniqueToA, uniqueToB } = pools(a, b)
  return Object.assign(shared, mix(uniqueToA, uniqueToB)))
}

export function randomConnection(genome: RawGenome): ConnectionGene {
  return choose(Object.values(genome))
}

export function randomPotentialConnection(genome: RawGenome) {
  let signatures = new Set(Object.values(genome).map(signature))
  let nodes = new Set(Object.values(genome).reduce((nodes, { from, to }) => (
    nodes[from] = true, nodes[to] = true, nodes
  ), {}))
  for (let from of shuffle(Object.keys(nodes)) {
    for (let to of shuffle(Object.keys(nodes)) {
      if (from !== to && !signatures.has(signature)){
        return { from, to }
      }
    }
  }
}


export function initalizNodeMutation(old: ConnectionGene, newConnections): RawGenome {
  let mutation = Object.keys(newConnections).reduce((m, innovation) => (
    m[innovation] = initializeConnection(newConnections[innovation]), m
  ), {})
  old.active = false
  mutation[old.innovation] = old
  return mutation
}
