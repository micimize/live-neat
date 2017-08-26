// http://sharpneat.sourceforge.net/research/speciation-canonical-neat.html
// using the original C++ distance, and assuming disjoint and excess genes have the same cost
// D = c1 * Ne + c2 * Nd + c3 * W
//
import { pools } from './raw-genome'

const innovationDifferenceCoefficient = 2
const weightDifferenceCoefficient = 1

const compatibilityThreshold = 6.0
const compatibilityModifier  = 0.3
const speciesTarget = 3

// TODO: currently treating disjoint and excess genes as equal
function distance(a: RawGenome, b: RawGenome) {
  //let aInnovations = Object.keys(a)
  //let bInnovations = Object.keys(b)
  //let aMostRecentInnovation = Math.max(aInnovations)
  //let bMostRecentInnovation = Math.max(bInnovations)
  //let strandSize = Math.max(aInnovations.length, bInnovations.length)
  let { shared, uniqueToA, uniqueToB } = pools(a, b, { structuralSharing: false })
  let innovationDifferences = Object.keys(uniqueToA).length + Object.keys(uniqueToB).length
  let sharedWeightDifferences = Object.keys(shared).reduce(
    (weightDifference, innovation) => Math.abs(a[innovation].weight - b[innovation].weight), 0)
  return innovationDifferences * innovationDifferenceCoefficient + \
    sharedWeightDifferences * weightDifferenceCoefficient
}

function addToSpecies(species: Array<RawGenome>, genome: RawGenome){
  for (let speciesMember of species) {
    if (distance(speciesMember, genome) < compatibilityThreshold) { 
      species.push(genome)
      return [ species, true ]
    }
  }
  return [ species, false ]
}

function speciate(genomes: Array<RawGenome>){
  let population = {}
  let speciesId = 0
  let success = false
  for (let genome of genomes) {
    for (let speciesId in population) {
      [ species, success ] = addToSpecies(species, genome)
      if (success) {
        population[speciesId] = species
        break // only breaks the inner loop
      }
    }
    if (!success) {
      population[speciesId++] = [genome]
    }
  }
  return population
}
