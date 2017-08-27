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


class Species {
  genomes: Set<Genome>;
  id: number;
  fitness: number;
  age: number = 1;
	expectedOffspring: number = 0;
  constructor(genome: Genome) {
    this.genomes = new Set(genome)
  }
  add(genome: Genome): boolean {
    for (let member of this.genomes){
      if (distance(speciesMember.connections, genome.connections) < compatibilityThreshold){
        this.genomes.add(genome)
      }
      return true
    }
    return false
  }
}


class Population {
  species: Set<Species>;
  constructor(genomes: Set<Genome>) {
    this.species = new Set()
    for (let genome of genomes){
      let speciated = false
      for (let species of this.species){
        speciated = species.add(genome)
        if (speciated){
          break
        }
      }
      if (!speciated){
        this.species.add(new Species(genome))
      }
    }
  }
}


