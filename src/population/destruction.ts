import { Population } from './population'
import Configuration from './configuration'
import { Record, Map, Set } from 'immutable'
import { InnovationChronicle } from '../innovation'
import { LeaderSelecter } from '../utils'
import { weightedSelection } from '../random-utils'
import { Species } from '../species'
import { Creature } from '../creature'
import { Genome } from '../genome'
import { litter } from './reproduction'

type ChronicleAndCreatures = { chronicle: InnovationChronicle, creatures: Set<Creature> }

function incrementAge<
  T extends { age: number, set: (attr: string, value: any) => T }
>(rec: T): T {
  return rec.set('age', rec.age + 1)
}

function ageSpecies(species: Species): Species {
  // TODO hardcoded
  let requiredImprovement = 0.01
  let { best, age } = species.stagnation
  let stagnation = (
    species.stagnation.best + requiredImprovement
  ) < species.fitness ?
    { age: 0, best: species.fitness } :
    { age: age + 1, best }
  return incrementAge(species)
    .map(incrementAge)
    .set('stagnation', stagnation)
}

function age(population: Population): Population {
  return incrementAge(population)
    .update('species', species => species.map(ageSpecies))
}

function replaceDying(population: Population, dying: number): ChronicleAndCreatures {
  return litter(
    population,
    population.configuration.population.minSize - (population.size - dying)
  )
}

function ComparatorDesc<T, C = { [P in keyof T]?: number }>(criteria: C){
  let measure = (item: T) => Object.keys(criteria)
    .reduce((sum, key) => sum + criteria[key] * item[key], 0)
  return (a: T, b: T) => measure(b) - measure(a) 
}

function HeroSelecter({ heroes }: Configuration['speciation']){
  return LeaderSelecter({
    limit: heroes.count,
    comparator: ComparatorDesc<Genome>(heroes.criteria)
  })
}

function buryTheDead(population: Population): Population {
  // TODO? select dead, handle keep alives, then kill
  let selecter = HeroSelecter(population.configuration.speciation)
  let heroes = population.heroes.asMutable()
  let species = population.species.map(species =>
    species.creatures
      .filter(creature => creature.energy <= 0)
      .reduce((s, dead) => {
        heroes = selecter(heroes, dead.genome)
        return species.kill(dead, selecter)
      }, species)
  )
  let dead = population.size - species.reduce((size, s) => size + s.size, 1)
  let { chronicle, creatures } = replaceDying(population, dead)
  return population
    .set('chronicle', chronicle)
    .set('species', species)
    .set('heroes', heroes)
    .withMutations(population => {
      for( let baby of creatures ) {
        population.add(baby)
      }
      return population
    })
}

// destroy poor performing and stagnating species
function cull(population: Population): Population {
  /*
  let { culling, stagnation, speciesCount } = configuration
  if (population.age % culling.regularity) {
    population.species
      .filter(({ age }) => age >= culling.minimumAge)
  }
  if (population.species.size > speciesCount) {
    // cull bottom (size - count) species
  }
  */
  return population
}

export { cull, buryTheDead, age }