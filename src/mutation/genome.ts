import { Set } from 'immutable'
import { deepmerge } from 'deepmerge'
import { InnovationChronicle, innovations } from '../innovation'
import * as random from '../random-utils'
import { Genome, ConnectionGenes, initialize } from '../genome'
import ConnectionGene, { PotentialConnection } from '../genome/connection-gene'
import configurator from '../configurator'
import * as connection from './connection'

type Mutation<A extends innovations.Innovatable> = { update?: innovations.Update<A> } & { genome: Genome }
type ChronicleAndGenome = { chronicle: InnovationChronicle, genome: Genome }

function randomConnection({ connections }: Genome): ConnectionGene {
  return random.selection(Array.from(connections.values()))
}

function getNodes(genome: Genome): Set<number> {
  return Set(genome.connections.values()).reduce(
    (nodes, { from, to }) => nodes.add(from).add(to),
    Set<number>()
  )
}

function validToNode(chronicle: InnovationChronicle, node: number): boolean {
  let { type = 'HIDDEN' } = chronicle.nodes.get(node) || {}
  return !['INPUT', 'BIAS'].includes(type)
}

function randomPotentialConnection({ chronicle, genome }: ChronicleAndGenome): PotentialConnection | void {
  let connections: Set<{ from: number, to: number }> = Set(genome.connectionList.map(
    ({ from, to }) => ({ from, to })
  ))
  let nodes = getNodes(genome)
  for (let from of random.shuffle(Array.from(nodes))) {
    for (let to of random.shuffle(Array.from(nodes).filter(node => validToNode(chronicle, node)))) {
      if(from !== to && !connections.contains({ from, to })){
        return { from, to }
      }
    }
  }
}

function insertNode({ chronicle, genome }: ChronicleAndGenome): Mutation<'nodes' | 'connections'> {
  if (Math.random() < configurator().mutation.newNodeProbability) {
    let old = randomConnection(genome)
    let update = innovations.insertNode(chronicle, old)
    return {
      update,
      genome: genome.mergeIn(
        ['connections'],
        initialize.node(old, update.connections)
      )
    }
  } else {
    return { genome }
  }
}

function newConnection({ chronicle, genome }: ChronicleAndGenome): Mutation<'connections'> {
  if (Math.random() < configurator().mutation.newConnectionProbability) {
    let potentialConnection = randomPotentialConnection({ chronicle, genome })
    if (potentialConnection) {
      let update = innovations.newConnection(chronicle, potentialConnection)
      return {
        update,
        genome: genome.mergeIn(
          ['connections'],
          initialize.connections(update.connections)
        )
      }
    }
  }
  return { genome }
}

function structural(args: ChronicleAndGenome): ChronicleAndGenome {
  let { update = {}, genome } = newConnection(args)
  let chronicle = args.chronicle.merge(update || {})
  let up = insertNode({ chronicle, genome })
  return { chronicle: chronicle.merge(up.update || {}), genome: up.genome }
}

function mutate({ chronicle, genome }: ChronicleAndGenome): ChronicleAndGenome {
  return structural({
    chronicle,
    genome: genome.map(connection.mutate)
  })
}

export { mutate }