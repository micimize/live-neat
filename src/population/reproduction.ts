import { Set } from 'immutable'
import { InnovationChronicle } from '../innovation'
import { weightedSelection } from '../random-utils'
import { Population } from './population'
import { Species, mate } from '../species'
import { Creature } from '../creature'
import { mutate, seed } from '../mutation'

type ChronicleAndCreature = { chronicle: InnovationChronicle, creature: Creature }
type ChronicleAndCreatures = { chronicle: InnovationChronicle, creatures: Set<Creature> }


function selectSpecies(species: Set<Species>): Species {
  return weightedSelection(Array.from(species), s => s.fitness ** 2)
}

function reproduce(population: Population): ChronicleAndCreature {
  let { mutation, reproduction } = population.configuration
  let crossedOver = mate({
    species: selectSpecies(population.livingSpecies),
    reproduction,
    mutation,
  })
  let { chronicle, genome } = mutate({
    chronicle: population.chronicle,
    genome: crossedOver,
    configuration: mutation,
  })
  let network = population.express({ chronicle, genome })
  return { chronicle, creature: new population.Creature({ genome, network }) }
} 

function litter(population: Population, batch: number): ChronicleAndCreatures  {
  let pop = population.asMutable()
  let creatures = Set<Creature>().withMutations(creatures => {
    while (batch --> 0) {
      let { creature, chronicle } = reproduce(pop)
      creatures.add(creature)
      pop.set('chronicle', chronicle)
    }
  })
  return { chronicle: pop.chronicle, creatures }
}

function attemptReproduction(population: Population): Population {
  let { desiredRate, requiredResources } = population.configuration.reproduction
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