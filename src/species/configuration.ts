import { Record } from 'immutable'

const speciation = {
  speciesCount: 4,
  heroCount: 5,
  stagnation: {
    acceptableGenerations: 20,
    cost: 10,
  },
  culling: {
    regularity: 30,
    minimumAge: 20
  },
  compatibility: {
    threshold: 3.0,
    modifier: 0.3,
    distance: {
      genome: {
        innovationDifferenceCoefficient: 2,
        weightDifferenceCoefficient: 1
      }
    }
  },
}

type SpeciationConfiguration = typeof speciation

const SpeciationConfiguration = Record<SpeciationConfiguration>(speciation)

export default SpeciationConfiguration
