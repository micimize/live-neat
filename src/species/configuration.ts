import { DeepRecord } from '../structures/deep-record'

const Configuration = DeepRecord({
  speciesCount: 4,
  heroes: {
    count: 10,
    criteria: { fitness: 1 }
  },
  stagnation: {
    acceptableGenerations: 20,
    cost: 10,
  },
  culling: {
    regularity: 30,
    minimumAge: 20
  },
  compatibility: {
    threshold: 30.0,
    modifier: 0.5,
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
})()

type Configuration = typeof Configuration
export default Configuration