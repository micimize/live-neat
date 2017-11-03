import { Set } from 'immutable'
import { deepmerge } from 'deepmerge'
import { InnovationChronicle, innovations } from '../innovation'
import * as random from '../random-utils'
import { CERTAINLY_IS } from '../utils'
import { Genome, ConnectionGenes, initialize } from '../genome'
import ConnectionGene, { PotentialConnection } from '../genome/connection-gene'
import Configuration from './configuration'
import * as connectionMutations from './connections'

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

const valid = {
  toNode(chronicle: InnovationChronicle, node: number): boolean {
    return !['INPUT', 'BIAS'].includes(
      chronicle.nodes.get(node, { type: 'HIDDEN' }).type || 'HIDDEN')
  },
  fromNode(chronicle: InnovationChronicle, node: number): boolean {
    return chronicle.nodes.get(node, {type: 'HIDDEN'}).type !== 'OUTPUT'
  }
}

function nodePool(chronicle, nodes, validator){
  return random.shuffle(Array.from(nodes).filter(node => validator(chronicle, node)))
}

function randomPotentialConnection(
  { chronicle, genome, configuration }: MutationScope
): PotentialConnection | void {
  let { canBeRecurrent } = configuration.connection
  let connections: Set<string> = Set(
    genome.connectionList.map(c => c.signature)
  )
  let isValid = (testing: PotentialConnection) =>
    (testing.from !== testing.to) &&
    !connections.has([testing.from, testing.to].join(',')) && (
      canBeRecurrent ||
      connectionMutations.checkForCycle(genome.connectionList, testing)
    )
  let nodes = getNodes(genome)
  for (let from of nodePool(chronicle, nodes, valid.fromNode)){
    for (let to of nodePool(chronicle, nodes, valid.toNode)) {
      if(isValid({ from, to })){
        return { from, to }
      }
    }
  }
}

function insertNode({ chronicle, genome, configuration }: MutationScope): Mutation<'nodes' | 'connections'> {
  if (random.should(configuration.newNodeProbability)) {
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

function newConnection({ chronicle, genome, configuration }: MutationScope): Mutation<'connections'> {
  if (random.should(configuration.newConnectionProbability)) {
    let potentialConnection = randomPotentialConnection({ chronicle, genome, configuration })
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
    genome: genome.update('connections', connectionMutations.mutater(scope.configuration.connection))
  })
}

export { mutate }