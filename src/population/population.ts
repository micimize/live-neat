import Structure from './structure'
import { Record, Map } from 'immutable'
import { InnovationContext } from '../innovation-context'
import { weightedSelection } from '../random-utils'
import configurator from '../configurator'
import Species from '../species/species'
import Creature from '../creature'
import { mutate, seed } from '../mutations'

import { CompetitiveSet } from '../structures'

// Creature should be dynamic, so the utilizing simulation can define it's own creature and have it managed
// * live-neat manages Population and evolution
// * utilizing simulation manages fitness and calls population.step as appropriate

class Population extends Structure {

  keepAlives(dying: number): Array<Creature> {
    let keepAliveCount = configurator().population.minSize - this.size - dying
    return Array(keepAliveCount)
      .fill(undefined)
      .map(_ => this.reproduce())
  }

  buryTheDead(): Population {
    // TODO select dead, handle keep alives, then kill
    let species = this.species.map(species =>
      species.creatures
        .filter(creature => creature.energy <= 0)
        .reduce((s, dead) => species.kill(dead), species))
    let dead = this.size - species.reduce((size, s) => size + s.size, 0)
    let keepAlives = this.keepAlives(dead)
    return keepAlives.reduce(
      (population, baby) => population.add(baby),
      this.set('species', species)
    )
  }

  add(creature: Creature): Population {
    let speciated = false
    for (let s of this.species){
      if(s.compatible(creature)){
        return this.set('species', this.species
          .delete(s)
          .concat(s.add(creature)))
      }
    }
    return this.set(
      'species',
      this.species.concat(
        Species.of({ creature })
      )
    )
  }

  selectSpecies(){
    return weightedSelection(Array.from(this.species), s => s.fitness ^ 2)
  }

  reproduce(): Creature {
    let genome = this.mutator.mutate(this.selectSpecies().procreate())
    let network = this.expressor.express(genome)
    return new this.CreatureType(network)
  }

  attemptReproduction(): Creature | void {
    let { desiredRate, requiredResources } = configurator().reproduction
    if (Math.random() < desiredRate) {
      this.resources -= requiredResources
      let creature = this.reproduce()
      this.add(creature)
      return creature
    }
  }

  // destroy poor performing and stagnating species
  cull() {
    let { culling, stagnation, speciesCount } = configurator().speciation
    if(this.age % culling.regularity){
      this.species
        .filter(({ age }) => age >= culling.minimumAge)
    }
    if(this.species.size > speciesCount){
      // cull bottom (size - count) species
    }
  }

  step(): Array<Creature> {
    let keepAlives = this.buryTheDead() // TODO this also handles keep alive, which is kinda dumb
    this.age++
    this.species.map(s => s.age++) // TODO internal state
    this.cull()
    if(this.resources > configurator().reproduction.requiredResources){
      let baby = this.attemptReproduction()
      if(baby) {
        keepAlives.push(baby)
      }
    }
    return keepAlives
  }

}

export default Population