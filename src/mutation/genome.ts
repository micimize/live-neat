import { Set } from 'immutable'
import { deepmerge } from 'deepmerge'
import { InnovationChronicle, innovations } from '../innovation'
import * as random from '../random-utils'
import { CERTAINLY_IS } from '../utils'
import { Genome, ConnectionGenes, initialize } from '../genome'
import ConnectionGene, { PotentialConnection } from '../genome/connection-gene'
import Configuration from './configuration'
import * as connection from './connection'

type Mutation<A extends innovations.Innovatable> = { update?: innovations.Update<A> } & { genome: Genome }
type InnovationScope = {
  chronicle: InnovationChronicle,
  genome: Genome
}
type MutationScope = InnovationScope & {
  configuration: Configuration
}

function randomConnection({ connections }: Genome): { innovation: number, connection: ConnectionGene } {
  let innovation = random.selection(Array.from(connections.keys()))
  let connection = connections.get(innovation)
  if (CERTAINLY_IS<ConnectionGene>(connection)){
    return { innovation, connection }
  }
  throw Error('impossible.')
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

function randomPotentialConnection({ chronicle, genome }: InnovationScope): PotentialConnection | void {
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

function insertNode({ chronicle, genome, configuration = Configuration() }: MutationScope): Mutation<'nodes' | 'connections'> {
  if (Math.random() < configuration.newNodeProbability) {
    let old = randomConnection(genome)
    let update = innovations.insertNode(chronicle, old.connection)
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

function newConnection({ chronicle, genome, configuration = Configuration() }: MutationScope): Mutation<'connections'> {
  if (Math.random() < configuration.newConnectionProbability) {
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

function structural(scope: MutationScope): InnovationScope {
  let { update = {}, genome } = newConnection(scope)
  let chronicle = scope.chronicle.merge(update || {})
  let up = insertNode({ chronicle, genome, configuration: scope.configuration })
  return { chronicle: chronicle.merge(up.update || {}), genome: up.genome }
}

function mutate({ genome, ...scope }: MutationScope): InnovationScope {
  return structural({
    ...scope,
    genome: genome.map(connection.mutater(scope.configuration.connection))
  })
}

export { mutate }