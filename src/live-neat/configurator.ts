
export default () => ({
  initialNetwork: {
    inputs: 5,
    outputs: 5,
    opener: 'fully-connected',
    activations: [ 'sigmoid' ]
  },
  population: {
    initialSize: 100,
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
    initialCompatibilityThreshold: 6.0,
    compatibilityThreshold: 6.0,
    compatibilityModifier: 0.3,
  },
  mutation: {
    newNodeProbability: 0.0025,
    newConnectionProbability: 0.1,
    weightChange: {
      probability: 0.9,
      power: 2.5
    },
    recurrence: 0.2,
    enable: 0.0,
    reenable: 0.2,
  }
})
