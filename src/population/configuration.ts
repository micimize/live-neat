import { Record } from 'immutable'
import Innovation from '../innovation/configuration'
import Mutation from '../mutation/configuration'

const global = {
  reproduction: {
    requiredResources: 100,
    desiredRate: 0.01,
    // a dead species will be as fit as their heroes with this modifier
    resurrectFromHeroesRate: 1,
    // living species will have their heroes genes included in the pool at this rate
    includeHeroGenesRate: 1,
    survivalThreshold: 0.2, // top 20% of each species may reproduce
    // must sum to 1
    kinds: {
      asexual: 0.25,
      sexual: 0.75,
    }
  },
  population: {
    initialSize: 100,
    minSize: 100,
  },
  speciation: {
    speciesCount: 4,
    heroCount: 5,
    initialCompatibilityThreshold: 20.0,
    compatibilityThreshold: 20.0,
    compatibilityModifier: 0.3,
    stagnation: {
      acceptableGenerations: 20,
      cost: 10, 
    },
    culling: {
      regularity: 30,
      minimumAge: 20
    }
  },
  creature: {
    ageSignificance: 1,// / 5,
  },
  innovation: Innovation(),
  mutation: Mutation()
}

type PopulationConfiguration = typeof global

const PopulationConfiguration = Record<PopulationConfiguration>(global)

export default PopulationConfiguration 
