import { Set } from 'immutable'
import { deepmerge } from 'deepmerge'
import { InnovationContext, innovations } from '../innovation-context'
import * as random from '../random-utils'
import Genome, { ConnectionGenes } from '../genome'
import ConnectionGene, { PotentialConnection } from '../genome/connection-gene'
import configurator from '../configurator'
import * as connection from './connection'
import { initializeConnections, initializeNode } from './initializers'

type Mutation<A extends innovations.Innovatable> = { update?: innovations.Update<A> } & { genome: Genome }
type ContextAndGenome = { context: InnovationContext, genome: Genome }

function randomConnection({ connections }: Genome): ConnectionGene {
  return random.selection(Array.from(connections.values()))
}

function getNodes(genome: Genome): Set<number> {
  return Set(genome.connections.values()).reduce(
    (nodes, { from, to }) => nodes.add(from).add(to),
    Set<number>()
  )
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

function insertNode({ context, genome }: ContextAndGenome): Mutation<'nodes' | 'connections'> {
  if (Math.random() < configurator().mutation.newNodeProbability) {
    let old = randomConnection(genome)
    let update = innovations.insertNode(context, old)
    return {
      update,
      genome: genome.mergeIn(
        ['connections'],
        initializeNode(old, update.connections)
      )
    }
  } else {
    return { genome }
  }
}

function newConnection({ context, genome }: ContextAndGenome): Mutation<'connections'> {
  if (Math.random() < configurator().mutation.newConnectionProbability) {
    let potentialConnection = randomPotentialConnection({ context, genome })
    if (potentialConnection) {
      let update = innovations.newConnection(context, potentialConnection)
      return {
        update,
        genome: genome.mergeIn(
          ['connections'],
          initializeConnections(update.connections)
        )
      }
    }
  }
  return { genome }
}

function structural(args: ContextAndGenome): ContextAndGenome {
  let { update = {}, genome } = newConnection(args)
  let context = args.context.merge(update || {})
  let up = insertNode({ context, genome })
  return { context, genome: up.genome }
}

function mutate({ context, genome }: ContextAndGenome): ContextAndGenome {
  return structural({
    context,
    genome: genome.map(connection.mutate)
  })
}

export { mutate, initializeConnections }