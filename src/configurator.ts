
export const INPUT_VECTOR_SIZE = 2
export const OUTPUT_VECTOR_SIZE = 1

export default () => ({
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
})
