import { DeepRecord } from '../structures/deep-record'

const Configuration = DeepRecord({
  speciesCount: 4,
  heroCount: 10,
  stagnation: {
    acceptableGenerations: 20,
    cost: 10,
  },
  culling: {
    regularity: 30,
    minimumAge: 20
  },
  compatibility: {
    threshold: 20.0,
    modifier: 1,
    thresholdBounds: {
      minimum: 1,
      maximum: Infinity,
    }, 
    distance: {
      genome: {
        innovationDifferenceCoefficient: 2,
        weightDifferenceCoefficient: 1
      }
    }
  }
})

type Configuration = typeof Configuration
export default Configuration