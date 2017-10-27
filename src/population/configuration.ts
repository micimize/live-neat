import { Record } from 'immutable'
import Innovation from '../innovation/configuration'
import Mutation from '../mutation/configuration'
import Speciation from '../species/configuration'

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
    initialSize: 50,
    minSize: 50,
  },
  creature: {
    ageSignificance: 1,// / 5,
  },
  innovation: Innovation(),
  mutation: Mutation(),
  speciation: Speciation()
}

type PopulationConfiguration = typeof global

const PopulationConfiguration = Record<PopulationConfiguration>(global)

export default PopulationConfiguration 
