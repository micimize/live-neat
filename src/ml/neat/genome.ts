import InnovationContext, { InnovationMap } from './innovation-context'
import { initializeConnection } from './connection-gene'
import { RawGenome, crossover, randomPotentialConnection, randomConnection, initializeNode } from './raw-genome'

function structuralMutations(genome: RawGenome, context: InnovationContext): RawGenome {
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
  fitness: number;
  connections: RawGenome;
  constructor(a: Genome, b?: Genome) {
    this.innovationContext = a.innovationContext
    // can only crossover from the same innovation context
    assert(!b || a.innovationContext === b.innovationContext)
    let inheritence = b ? crossover(a.connections, b.connections) : a.connections
    this.connections = mutate(inheritence, this.innovationContext)
  }
}

export function seedGenomes(innovationContext: InnovationContext, count = 10): Set<Genome>{
  let connections = innovationContext.connections
  Object.keys(connections).forEach(innovation =>
    connections[innovaction] = initializeConnection(connections[innovation]))
  let seed = { connections, InnovationContext }
  return new Set((new Array(count)).fill().map(_ => new Genome(seed)))
}
