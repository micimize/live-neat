import InnovationContext from './innovation-context'
import { Mutator } from './genome'
import GeneExpresser from './network/vanilla'

import { weightedChoice } from './random-utils'
import configurator from './configurator'
import Species from './species'
import Creature from './creature'

// Creature should be dynamic, so the utilizing simulation can define it's own creature and have it managed
// * live-neat manages Population and evolution
// * utilizing simulation manages fitness and calls population.step as appropriate

interface ICreature {
  new (...rest: any[]): Creature;
}

export default class Population {
  species: Set<Species>;
  Creature: ICreature;
  mutator: Mutator;
  expressor: GeneExpresser;
  resources: number = 0;
  age: number = 0;

  constructor(CreatureClass: ICreature = Creature) {
    let context = new InnovationContext()
    this.mutator = new Mutator(context)
    this.expressor = new GeneExpresser(context)

    this.Creature = CreatureClass
    let genomes = Array.from(this.mutator.seed(configurator().population.initialSize))
    let creatures = new Set(genomes.map(genome => new CreatureClass(this.expressor.express(genome))))
    this.species = new Set()
    for (let creature of creatures){
      this.add(creature)
    }
  }

  get size(){
    return Array.from(this.species).reduce((size, s) => size + s.creatures.size, 0)
  }

  get creatures(){
    let creatures: Creature[] = []
    for (let species of this.species) {
      creatures = creatures.concat(Array.from(species.creatures))
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

  buryTheDead(): Array<Creature> {
    let keepAlives: Creature[] = []
    for (let species of this.species) {
      for (let creature of species.creatures) {
        if (creature.energy <= 0){
          if(creature.kill){
            creature.kill()
          }
          if(this.size + keepAlives.length - 1 <= configurator().population.minSize){
            let creature = new this.Creature(
              this.expressor.express(this.selectSpecies().procreate())
            )
            this.add(creature)
            keepAlives.push(creature)
          }
          species.kill(creature)
        }
      }
    }
    return keepAlives
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

  attemptReproduction(): Creature | void {
    let { desiredRate, requiredResources } = configurator().reproduction
    if (Math.random() < desiredRate) {
      this.resources -= requiredResources
      let creature = new this.Creature(this.expressor.express(this.selectSpecies().procreate()))
      this.add(creature)
      return creature
    }
  }

  step(): Array<Creature> {
    let keepAlives = this.buryTheDead() // TODO this also handles keep alive, which is kinda dumb
    this.age++
    if(this.resources > configurator().reproduction.requiredResources){
      let baby = this.attemptReproduction()
      if(baby) {
        keepAlives.push(baby)
      }
    }
    return keepAlives
  }

}

