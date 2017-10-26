import { Record, Map, Set } from 'immutable'
import { InnovationChronicle } from '../innovation'
import { weightedSelection } from '../random-utils'
import configurator from '../configurator'
import { Population } from './population'
import { Species } from '../species'
import { Creature } from '../creature'
import { mutate, seed } from '../mutation'

import { SortedSet } from '../structures'
type ChronicleAndCreature = { chronicle: InnovationChronicle, creature: Creature }
type ChronicleAndCreatures = { chronicle: InnovationChronicle, creatures: Set<Creature> }


function selectSpecies(species: SortedSet<Species>): Species {
  return weightedSelection(Array.from(species), s => s.fitness ^ 2)
}

function reproduce(population: Population): ChronicleAndCreature {
  let { chronicle, genome } = mutate({
    chronicle: population.chronicle,
    genome: selectSpecies(population.species).procreate()
  })
  let network = population.express({ chronicle, genome })
  return { chronicle, creature: new population.Creature({ genome, network }) }
} 

function litter(population: Population, batch: number): ChronicleAndCreatures  {
  let creatures = Set<Creature>().withMutations(creatures => {
    while (batch-- > 0) {
      let { creature, chronicle } = reproduce(population)
      creatures.add(creature)
      population = population.set('chronicle', chronicle)
    }
  })
  return { chronicle: population.chronicle, creatures }
}

function attemptReproduction(
  population: Population
): Population {
  let { desiredRate, requiredResources } = configurator().reproduction
  if (Math.random() < desiredRate && population.resources >= requiredResources) {
    let resources = population.resources - requiredResources
    let { chronicle, creature } = reproduce(population)
    return population
      .merge({ chronicle, resources })
      .add(creature)
  }
  return population
}

export { reproduce, attemptReproduction, litter }