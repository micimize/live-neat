import { DeepRecord, DeepPartial } from '../structures/deep-record'
import innovation from '../innovation/configuration'
import mutation from '../mutation/configuration'
import speciation from '../species/configuration'

const Configuration = DeepRecord({
  reproduction: {
    requiredResources: 100,
    desiredRate: 0.01,
    // a dead species will be as fit as their heroes with this modifier
    // TODO was ripped out in refactor
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
    initialSize: 150,
    minSize: 150,
  },
  creature: {
    ageSignificance: 1,// / 5,
  },
  innovation,
  mutation,
  speciation
})

type Configuration = typeof Configuration
namespace Configuration {
  export type Partial = DeepPartial<Configuration>
}

export default Configuration