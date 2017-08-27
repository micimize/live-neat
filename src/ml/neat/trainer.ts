import Population from './population'


interface Trainer {
  population: Population,
  configuration: {
    context: {
      inputs: 5,
      outputs: 5,
      opener: 'fully-connected',
      activations: [ 'sigmoid' ]
    }
    initialPopulationSize: 100,
    speciation: {
      speciesCount: 4,
      ageSignificance: 4,
      initialCompatibilityThreshold: 6.0,
      compatibilityModifier: 0.3,
      structuralVsWeight: 2,
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
      reenable: 0.0,
    }
  }
}

class Trainer {
  population: Population;
  constructor(config) {
    let context = new InnovationContext(config.context)
    let mutator = new Mutator(context, config.mutation)
    let population = seedPopulation(mutator, config.population)
    this.population = seedPopulation(innovationContext, size: config.initialPopulationSize, speciesCount)
  }
  step({ dead, born }: { dead: Set<Genome>, born: number }) {
  }
}
