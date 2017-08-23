import InnovationContext, { InnovationMap } from './innovation-context'
import { initializeConnection } from './connection-gene'
import { RawGenome, crossover, randomPotentialConnection, randomConnection, initializeNode } from './raw-genome'

// TODO unfinished
function structuralMutations(genome: RawGenome, context: InnovationContext){
  if (Math.random() < newNodeRate) {
    let connection = randomConnection(genome)
    let mutated = initializeNode(connection, context.insertNode(connection))
    genome = Object.assign(genome, mutated)
  }
  if (Math.random() < newConnectionRate) {
    let gene = initializeConnection(context.newConnection(randomPotentialConnection(genome)))
    genome[gene.innovation] = gene
  }
  return genome
}

function mutate(genome: RawGenome, context: InnovationContext) {
  genome = structuralMutations(genome, context)
  Object.keys(genome).forEach(innovation =>
    genome[innovation] = mutateWeights(genome[innovation]))
  return genome
} 

class Genome {
  innovationContext: InnovationContext;
  connections: RawGenome;
  constructor(a: Genome, b: Genome) {
    // can only crossover from the same innovation context
    assert(a.innovationContext === b.innovationContext)
    this.innovationContext = a.innovationContext
    let inheritence = crossover(a.connections, b.connections).map(mutate)
    this.connections = mutate(inheritence, innovationContext)
  }
  randomLiveConnection() {
    var c = R.randi(0, this.connections.length)
    while (!c.active) { // TODO generator
      c = R.randi(0, this.connections.length)
    }
    return c

  }

}

