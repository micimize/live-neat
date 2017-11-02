import { Record, Set } from 'immutable'
import { Genome, ConnectionGenes } from './genome'
import { pool } from './gene-pooling'
import Configuration from '../species/configuration'

const genomePools = (genomes: Array<Genome>) =>
  pool<number>(genomes.map(g => Set(g.connections.keys())))


function forcefulGetWeight(genes: ConnectionGenes, innovation: number){
  let connection = genes.get(innovation)
  if(!connection){
    throw Error(`Impossible! connection ${innovation} missing from genes ${genes}`)
  }
  return connection.weight
}

function weightDifferences(shared: Set<number>, a: ConnectionGenes, b: ConnectionGenes){
  return shared.reduce((difference, innovation) => 
    difference + Math.abs(
      forcefulGetWeight(a, innovation) - forcefulGetWeight(b, innovation)
    ),
    0
  )
}

// http://sharpneat.sourceforge.net/research/speciation-canonical-neat.html
// using the original C++ distance, and assuming disjoint and excess genes have the same cost
// D = c1 * Ne + c2 * Nd + c3 * W
//
// TODO should distance be a custom module?
// otherwise, the configuration for genome distance should exist in /genome
export default function distance(
  {
    innovationDifferenceCoefficient,
    weightDifferenceCoefficient
  }: Configuration['compatibility']['distance']['genome'],
  [ _a, _b ]: Array<Genome>
): number {
  //let aInnovations = Object.keys(a)
  //let bInnovations = Object.keys(b)
  //let aMostRecentInnovation = Math.max(aInnovations)
  //let bMostRecentInnovation = Math.max(bInnovations)
  //let strandSize = Math.max(aInnovations.length, bInnovations.length)
  let innovationDifferences = 0
  let sharedWeightDifferences = 0
  let a = _a.connections.asMutable()
  let b = _b.connections.asMutable()
  for (let [innovation, aConn] of a){
    let bConn = b.get(innovation)
    if(bConn){
      sharedWeightDifferences += Math.abs(bConn.weight - aConn.weight)
      b.delete(innovation)
    } else {
      innovationDifferences++
    }
  }
  innovationDifferences += b.size
  return (
    innovationDifferences * innovationDifferenceCoefficient +
    sharedWeightDifferences * weightDifferenceCoefficient
  )
}
