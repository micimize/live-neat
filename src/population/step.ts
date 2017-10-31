import { Population } from './population'
import { attemptReproduction } from './reproduction'
import { cull, buryTheDead, age } from './destruction'
import { thread } from '../utils'
import { bounder, adjuster } from '../utils'

function adjustConfiguration(population: Population): Population {
  let configuration = population.configuration
  let { speciesCount, compatibility } = configuration.speciation
  let bound = bounder(compatibility.thresholdBounds)
  let adjust = adjuster(compatibility.modifier)
  return population.set(
    'configuration', configuration({
      speciation: {
        compatibility: {
          threshold: bound( adjust( compatibility.threshold, population.livingSpecies.size - speciesCount ))
        }
      }
    })
  )
}

// Creature should be dynamic, so the utilizing simulation can define it's own creature and have it managed
// * live-neat manages Population and evolution
// * utilizing simulation manages fitness and calls population.step as appropriate

function step(population: Population): Population {
  return thread(
    population,
    buryTheDead,
    age,
    cull,
    attemptReproduction,
    adjustConfiguration
  )
}

export { step }