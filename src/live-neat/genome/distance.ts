import Genome from './type'
import { pools } from './crossover'
import configurator from '../configurator'

function weightDifferences(shared, a, b){
  return Object.keys(shared).reduce((weightDifference, innovation) =>
    Math.abs(a[innovation].weight - b[innovation].weight), 0)
}

// http://sharpneat.sourceforge.net/research/speciation-canonical-neat.html
// using the original C++ distance, and assuming disjoint and excess genes have the same cost
// D = c1 * Ne + c2 * Nd + c3 * W
//
export default function distance(a: Genome, b: Genome): number {
  //let aInnovations = Object.keys(a)
  //let bInnovations = Object.keys(b)
  //let aMostRecentInnovation = Math.max(aInnovations)
  //let bMostRecentInnovation = Math.max(bInnovations)
  //let strandSize = Math.max(aInnovations.length, bInnovations.length)
  let { shared, uniqueToA, uniqueToB } = pools(a, b, { structuralSharing: false })
  let innovationDifferences = Object.keys(uniqueToA).length + Object.keys(uniqueToB).length
  let sharedWeightDifferences = weightDifferences(shared, a, b)
  let {
    innovationDifferenceCoefficient,
    weightDifferenceCoefficient
  } = configurator().distance
  return (
    innovationDifferences * innovationDifferenceCoefficient +
    sharedWeightDifferences * weightDifferenceCoefficient
  )
}
