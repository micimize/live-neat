import { Population } from './population'
import { Record, Map, Set } from 'immutable'
import { InnovationChronicle } from '../innovation'
import { weightedSelection } from '../random-utils'
import configurator from '../configurator'
import { Species } from '../species'
import Creature from '../creature'
import { litter } from './reproduction'

type ChronicleAndCreatures = { chronicle: InnovationChronicle, creatures: Set<Creature> }

function incrementAge<
  T extends { age: number, set: (attr: string, value: any) => T }
>(rec: T): T {
  return rec.set('age', rec.age + 1)
}

function age(population: Population): Population {
  return incrementAge(population)
    .update('species', species => species.map(s =>
      incrementAge(s).update('creatures', creatures =>
        creatures.map(incrementAge))))
}

function replaceDying(population: Population, dying: number): ChronicleAndCreatures {
  return litter(
    population,
    configurator().population.minSize - population.size - dying
  )
}

function buryTheDead(population: Population): Population {
  // TODO select dead, handle keep alives, then kill
  let species = population.species.map(species =>
    species.creatures
      .filter(creature => creature.energy <= 0)
      .reduce((s, dead) => species.kill(dead), species))
  let dead = population.size - species.reduce((size, s) => size + s.size, 1)
  let { chronicle, creatures } = replaceDying(population, dead)
  return population
    .merge({ chronicle, species })
    .withMutations(population => {
      for( let baby of creatures ) {
        population.add(baby)
      }
      return population
    })
}

// destroy poor performing and stagnating species
function cull(population: Population): Population {
  let { culling, stagnation, speciesCount } = configurator().speciation
  if (population.age % culling.regularity) {
    population.species
      .filter(({ age }) => age >= culling.minimumAge)
  }
  if (population.species.size > speciesCount) {
    // cull bottom (size - count) species
  }
  return population
}

export { cull, buryTheDead, age }