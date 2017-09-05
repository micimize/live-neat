
export const INPUT_VECTOR_SIZE = (3 + (5 * 5 * 3))
export const OUTPUT_VECTOR_SIZE = 4 * 4

export default () => ({
  initialNetwork: {
    inputs: INPUT_VECTOR_SIZE,
    outputs: OUTPUT_VECTOR_SIZE,
    opener: 'fully-connected',
    activations: [ 'sigmoid' ]
  },
  population: {
    initialSize: 100,
    minSize: 100,
    ageSignificance: 4,
  },
  reproduction: {
    requiredResources: 100,
    desiredRate: 0.01
  },
  distance: {
    innovationDifferenceCoefficient: 3,
    weightDifferenceCoefficient: 1
  },
  speciation: {
    speciesCount: 4,
    heroCount: 5,
    initialCompatibilityThreshold: 6.0,
    compatibilityThreshold: 6.0,
    compatibilityModifier: 0.3,
  },
  mutation: {
    newNodeProbability: 1,//0.0025,
    newConnectionProbability: 1,
    weightChange: {
      probability: 0.9,
      power: 2.5
    },
    recurrence: 0.2,
    enable: 0.0,
    reenable: 0.2,
  }
})
