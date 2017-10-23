import { Population } from './population'
import { Record, Map, Set } from 'immutable'
import { InnovationChronicle } from '../innovation'
import { weightedSelection } from '../random-utils'
import configurator from '../configurator'
import { Species } from '../species'
import { attemptReproduction } from './reproduction'
import { cull, buryTheDead, age } from './destruction'
import { thread } from '../utils'

// Creature should be dynamic, so the utilizing simulation can define it's own creature and have it managed
// * live-neat manages Population and evolution
// * utilizing simulation manages fitness and calls population.step as appropriate

function step(population: Population): Population {
  return thread(population,
    buryTheDead,
    age,
    cull,
    attemptReproduction
  )
}

export { step }