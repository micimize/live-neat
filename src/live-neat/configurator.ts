
export default _ => ({
  initialNetwork: {
    inputs: 5,
    outputs: 5,
    opener: 'fully-connected',
    activations: [ 'sigmoid' ]
  },
  population: {
    initialSize: 100,
    ageSignificance: 4,
  }
  distance: {
    innovationDifferenceCoefficient: 3,
    weightDifferenceCoefficient: 1
  }
  speciation: {
    speciesCount: 4,
    initialCompatibilityThreshold: 6.0,
    compatibilityModifier: 0.3,
  }
  mutation: {
    nodeProbability: 0.0025,
    linkProbability: 0.1,
    linkWeight: {
      probability: 0.9,
      power: 2.5
    }
    recurrence: 0.2,
    enable: 0.0,
    reenable: 0.2,
  }
})
