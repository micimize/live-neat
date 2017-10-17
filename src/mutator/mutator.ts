import { Set, Map, Record } from 'immutable'
import InnovationContext, { Mutated } from '../innovation-context/innovation-context'
import * as random from '../random-utils'
import Genome, { ConnectionGenes } from '../genome'
import ConnectionGene, { PotentialConnection } from '../genome/connection-gene'
import configurator from '../configurator'
import * as m from './mutations'

type MutatedGenome = Mutated & { genome: Genome }
type ContextAndGenome = MutatedGenome

function randomConnection({ connections }: Genome): ConnectionGene {
  return random.selection(Array.from(connections.values()))
}

function getNodes(genome: Genome): Set<number> {
  return Set(genome.connections.values()).reduce(
    (nodes, { from, to }) => nodes.add(from).add(to),
    Set<number>()
  ) }

function initializeConnections(newConnections: Map<number, PotentialConnection>): ConnectionGenes{
  type Entry = [number, PotentialConnection]
  type GeneEntry = [number, ConnectionGene]
  return Map<number, ConnectionGene>(
    Array.from(newConnections.entries())
      .map(([innovation, connection]: Entry): GeneEntry =>
        [innovation, ConnectionGene.of({ innovation, ...connection })])
  )
}

function initializeNode(
  old: ConnectionGene,
  newConnections: Map<number, PotentialConnection>
): ConnectionGenes {
  return initializeConnections(newConnections)
    .set(old.innovation, old.set('active', false))
}

function node({ context: c, genome }: ContextAndGenome): ContextAndGenome {
  if (Math.random() < configurator().mutation.newNodeProbability) {
    let old = randomConnection(genome)
    let { context, connections } = c.insertNode(old)
    let mutated = initializeNode(old, connections)
    return {
      context,
      genome: genome.mergeIn(['connections'], mutated)
    }
  } else {
    return { context: c, genome }
  }
}

function validToNode(context: InnovationContext, node: number): boolean {
  return !['INPUT', 'BIAS'].includes(context.nodes[node].type || '')
}

function randomPotentialConnection({ context, genome }: ContextAndGenome): PotentialConnection | void {
  let connections: Set<{ from: number, to: number }> = Set(genome.connectionList.map(
    ({ from, to }) => ({ from, to })
  ))
    let nodes = getNodes(genome)
    for (let from of random.shuffle(Array.from(nodes))) {
      for (let to of random.shuffle(Array.from(nodes).filter(node => validToNode(context, node)))) {
        if(from !== to && !connections.contains({ from, to })){
          return { from, to }
        }
      }
  }
}

function connection({ context, genome }: ContextAndGenome): ContextAndGenome {
  if (Math.random() < configurator().mutation.newConnectionProbability) {
    let potentialConnection = randomPotentialConnection({ context, genome })
    if (potentialConnection) {
      let { context: c, connections } = context.newConnection(potentialConnection)
      return {
        context: c,
        genome: genome.mergeIn(['connections'], initializeConnections(connections))
      }
    }
  }
  return { context, genome }
}

function structural(cg: ContextAndGenome): ContextAndGenome {
  return node(connection(cg))
}

function connectionLevel(genome: Genome): Genome {
  return genome.map(m.connection)
}

function mutate({ context, genome }: ContextAndGenome): ContextAndGenome {
  return structural({
    context,
    genome: connectionLevel(genome)
  })
}

function seed(
  context: InnovationContext,
  size: number,
  genome: Genome = Genome.of({ connections: initializeConnections(context.connections) }),
): Mutated & { genomes: Set<Genome> } {
  let genomes: Set<Genome> = Set()
  while (size--){
    let { genome: g, context: c } = mutate({ context, genome })
    context = c
    genomes = genomes.add(g)
  }
  return { context, genomes }
}

