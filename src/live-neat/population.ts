import { Mutator } from './genome'
import { weightedChoice } from '../random-utils'
import configurator from './configurator'
import Species from './species'
import Creature from './creature'
import GeneExpresser from './network/vanilla'

export default class Population { species: Set<Species>;
  mutator: Mutator;
  expressor: GeneExpresser;
  resources: number;
  age: number;

  constructor(mutator, expressor, creatures?: Set<Creature>) {
    this.mutator = mutator
    this.expressor = expressor
    if (!creatures) {
      let genomes = Array.from(this.mutator.seed(configurator().population.initialSize))
      creatures = new Set(genomes.map(genome => new Creature(this.expressor.express(genome))))
    }
    this.species = new Set()
    for (let creature of creatures){
      this.add(creature)
    }
  }

  delete(creature: Creature) {
    for (let species of this.species) {
      if(species.creatures.has(creature)) {
        return species.creatures.delete(creature)
      }
    }
    return false
  }

  buryTheDead() {
    for (let species of this.species) {
      for (let creature of species.creatures) {
        if (creature.fitness <= 0){
          species.creatures.delete(creature)
        }
      }
    }
    return false
  }

  add(creature: Creature) {
    let speciated = false
    for (let species of this.species){
      speciated = species.add(creature)
      if (speciated){
        break
      }
    }
    if (!speciated){
      this.species.add(new Species(creature))
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
      this.add(new Creature(this.expressor.express(this.selectSpecies().procreate()))
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

