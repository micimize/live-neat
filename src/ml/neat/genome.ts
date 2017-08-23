import InnovationContext, { InnovationMap } from './innovation-context'
import { initializeConnection } from './connection-gene'
import { RawGenome, crossover, randomPotentialConnection, randomConnection, initializeNode } from './raw-genome'

function structuralMutations(genome: RawGenome, context: InnovationContext): RawGenome{
  if (Math.random() < newNodeRate) {
    let connection = randomConnection(genome)
    let mutated = initializeNode(connection, context.insertNode(connection))
    Object.assign(genome, mutated)
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

export default class Genome {
  innovationContext: InnovationContext;
  connections: RawGenome;
  constructor(a: Genome, b: Genome) {
    // can only crossover from the same innovation context
    assert(a.innovationContext === b.innovationContext)
    this.innovationContext = a.innovationContext
    let inheritence = crossover(a.connections, b.connections).map(mutate)
    this.connections = mutate(inheritence, innovationContext)
  }
}

export function seedGenome(innovationContext: InnovationContext){
  let connections = innovationContext.connections
  Object.keys(connections).forEach(innovation =>
    connections[innovaction] = initializeConnection(connections[innovation]))
  let adam = {
    innovationContext,
    connections: mutate(connections, innovationContext)
  }
  let eve = {
    innovationContext,
    connections: mutate(connections, innovationContext)
  }
  return new Genome(adam, eve)
}
