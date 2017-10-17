import { Record, Set } from 'immutable'
import Genome, { ConnectionGenes } from './genome'
import { pool } from './gene-pooling'
import configurator from '../configurator'


const genomePools = (genomes: Array<Genome>) =>
  pool<number>(genomes.map(g => g.connections).map(m => Set(m.keys())))

export const configuration = Record({
  innovationDifferenceCoefficient: 2,
  weightDifferenceCoefficient: 1
})

function weightDifferences(shared: Set<number>, a: ConnectionGenes, b: ConnectionGenes){
  return shared.reduce((weightDifference, innovation) =>
    Math.abs(a[innovation].weight - b[innovation].weight), 0)
}

// http://sharpneat.sourceforge.net/research/speciation-canonical-neat.html
// using the original C++ distance, and assuming disjoint and excess genes have the same cost
// D = c1 * Ne + c2 * Nd + c3 * W
//
export default function distance([ a, b ]: Array<Genome>): number {
  //let aInnovations = Object.keys(a)
  //let bInnovations = Object.keys(b)
  //let aMostRecentInnovation = Math.max(aInnovations)
  //let bMostRecentInnovation = Math.max(bInnovations)
  //let strandSize = Math.max(aInnovations.length, bInnovations.length)
  let { intersection, disjoint: [ uniqueToA, uniqueToB ] } = genomePools([ a, b ])
  let innovationDifferences = uniqueToA.size + uniqueToB.size
  let sharedWeightDifferences = weightDifferences(intersection, a.connections, b.connections)
  let {
    innovationDifferenceCoefficient,
    weightDifferenceCoefficient
  } = configurator().genome.crossover.distance
  return (
    innovationDifferences * innovationDifferenceCoefficient +
    sharedWeightDifferences * weightDifferenceCoefficient
  )
}
