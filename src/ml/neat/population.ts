import { seed as seedGenome } from './genome'
import { weightedChoice } from './random-utils'
import configurator from './configurator'

export default class Population {

  species: Set<Species>;
  mutator: Mutator;
  resources: number;
  age: number;

  constructor(mutator, genomes?: Set<Genome>) {
    this.mutator = mutator
    if (!genomes) {
      genomes = this.mutator.seed(configurator().population.initialSize)
    }
    this.species = new Set()
    for (let genome of genomes){
      this.add(genome)
    }
  }

  delete(creature: Creature) {
    for (let species of this.species) {
      if(species.has(creature)) {
        return species.delete(creature)
      }
    }
    return false
  }

  buryTheDead() {
    for (let species of this.species) {
      for (let creature of species.creatures) {
        if (creature.fitness <= 0){
          species.delete(creature)
        }
      }
    }
    return false
  }

  add(genome: Genome) {
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

  selectSpecies(){
    let weights = {}
    let getter = {}
    for (let species of this.species) {
      let { fitness, id } = species
      weights[id] = fitness
      getter[id] = species
    }
    return getter[weightedChoice(weights)]
  }

  attemptReproduction(){
    let { desiredRate, requiredResources } = configurator().reproduction
    if (Math.random() < desiredRate) {
      this.resources -= requiredResources
      this.add(this.selectSpecies().procreate())
    }
  }

  step(){
    this.buryTheDead()
    if(this.resources > configurator().reproduction.requiredResources){
      this.attemptReproduction()
    }
    this.age++
    return this
  }

}

