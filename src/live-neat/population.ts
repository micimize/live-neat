import InnovationContext from './innovation-context'
import { Mutator } from './genome'
import GeneExpresser from './network/vanilla'

import { weightedChoice } from '../random-utils'
import configurator from './configurator'
import Species from './species'
import Creature from './creature'

// Creature should be dynamic, so the utilizing simulation can define it's own creature and have it managed
// * live-neat manages Population and evolution
// * utilizing simulation manages fitness and calls population.step as appropriate

interface ICreature {
  new (...any[]): Creature;
}

export default class Population {
  species: Set<Species>;
  mutator: Mutator;
  expressor: GeneExpresser;
  resources: number;
  age: number;

  constructor(CreatureClass: ICreature = Creature) {
    let context = new InnovationContext()
    this.mutator = new Mutator(context)
    this.expressor = new GeneExpresser(context)

    let genomes = Array.from(this.mutator.seed(configurator().population.initialSize))
    let creatures = new Set(genomes.map(genome => new CreatureClass(this.expressor.express(genome))))
    this.species = new Set()
    for (let creature of creatures){
      this.add(creature)
    }
  }

  get size(){
    return Array.from(this.species).reduce((size, s) => size + s.size, 0)
  }

  get creatures(){
    let creatures = []
    for (let species of this.species) {
      creatures = creatures.concat(species.creatures)
    }
    return creatures
  }

  forEachCreature(func: Function): void {
    for (let species of this.species) {
      for (let creature of species.creatures) {
        func(creature)
      }
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
        if (creature.energy <= 0){
          if(creature.kill){
            creature.kill()
          }
          species.kill(creature)
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

  attemptReproduction(): Creature? {
    let { desiredRate, requiredResources } = configurator().reproduction
    if (Math.random() < desiredRate) {
      this.resources -= requiredResources
      let creature = new Creature(this.expressor.express(this.selectSpecies().procreate()))
      this.add(creature)
      return creature
    }
  }

  step(): Creature? {
    this.buryTheDead()
    if(this.resources > configurator().reproduction.requiredResources){
      this.age++
      return this.attemptReproduction()
    }
    this.age++
  }

}

