
export const INPUT_VECTOR_SIZE = 2
export const OUTPUT_VECTOR_SIZE = 1

export default () => ({
  initialNetwork: {
    inputs: INPUT_VECTOR_SIZE,
    outputs: OUTPUT_VECTOR_SIZE,
    opener: 'fully-connected',
    activations: [ 'sigmoid' ]
  },
  population: {
    initialSize: 50,
    minSize: 50,
    ageSignificance: 1 / 5,
  },
  reproduction: {
    requiredResources: 100,
    desiredRate: 0.01
  },
  distance: {
    innovationDifferenceCoefficient: 2,
    weightDifferenceCoefficient: 1
  },
  speciation: {
    speciesCount: 4,
    heroCount: 5,
    initialCompatibilityThreshold: 20.0,
    compatibilityThreshold: 20.0,
    compatibilityModifier: 0.3,
  },
  mutation: {
    newNodeProbability: 0.0025,
    newConnectionProbability: 0.01,
    weightChange: {
      probability: 0.9,
      power: 2.5
    },
    recurrence: 0.2,
    enable: 0.0,
    reenable: 0.2,
  }
})
