
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
    ageSignificance: 1,// / 5,
  },
  reproduction: {
    requiredResources: 100,
    desiredRate: 0.01,
    // a dead species will be as fit as their heroes with this modifier
    resurrectFromHeroesRate: 1,
    // living species will have their heroes genes included in the pool at this rate
    includeHeroGenesRate: 1,
    survivalThreshold: 0.2, // top 20% of each species may reproduce
  },
  genome: {
    connection: {
      initialWeightPower: 1,
      // DON'T CHANGE THIS!
      // theoretically, the structural same connection in different contexts should be considered different
      // however, that requires implementing structure equivalence/preference at crossover time
      maintainStructuralUniqueness: true
    },
    crossover: {
      distance: {
        innovationDifferenceCoefficient: 2,
        weightDifferenceCoefficient: 1
      },
      connection: {
        // favor active & active weights when crossing over genomes with the same connection
        favoredInIntersection: {
          active: false,
          probability: 0.7
        }
      }
    }
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
  mutation: {
    newNodeProbability: 0.01,
    newConnectionProbability: 0.3,
    weightChange: {
      probability: 0.8,
      power: 1
    },
    recurrence: 0.2,
    enable: 0.0,
    reenable: 0.2,
  }
})
