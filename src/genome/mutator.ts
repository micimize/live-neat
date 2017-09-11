import { Set } from 'immutable'
import InnovationContext, { InnovationMap } from '../innovation-context'
import * as random from '../random-utils'
import { PotentialConnection, ConnectionGene, signature, initializeConnection, mutateWeight } from './connection-gene'
import Genome from './type'
import configurator from '../configurator'

function randomConnection(genome: Genome): ConnectionGene {
  return random.selection(Object.values(genome))
}

function getNodes(genome: Genome): Set<number> {
  return Object.values(genome).reduce(
    (nodes, { from, to }: PotentialConnection) => nodes.add(from).add(to),
    Set<number>()
  )
}

function randomPotentialConnection(genome: Genome): PotentialConnection | void {
  let signatures: Set<string> = Set.of(...Object.values(genome).map(signature))
  let nodes = getNodes(genome)
  for (let from of random.shuffle(Array.from(nodes))) {
    for (let to of random.shuffle(Array.from(nodes))) {
      if (from !== to && !signatures.has(signature({ from, to }))){
        return { from, to }
      }
    }
  }
}


function initializeNode(
  old: ConnectionGene,
  newConnections: InnovationMap<PotentialConnection>
): Genome {
  let mutation = Object.keys(newConnections).reduce((m, innovation) => (
    m[innovation] = initializeConnection(newConnections[innovation]), m
  ), {})
  old.active = false
  mutation[old.innovation] = old
  return mutation
}

export default class Mutator {

  context: InnovationContext;

  constructor(context: InnovationContext){
    this.context = context
  }

  node(genome: Genome){
    if (Math.random() < configurator().mutation.newNodeProbability) {
      let connection = randomConnection(genome)
      let mutated = initializeNode(connection, this.context.insertNode(connection))
      return Object.assign({}, genome, mutated)
    }
    return genome
  }

  connection(genome: Genome){
    if (Math.random() < configurator().mutation.newConnectionProbability) {
      let potentialConnection = randomPotentialConnection(genome)
      if (potentialConnection){
        let connection = this.context.newConnection(potentialConnection)
        let gene = initializeConnection(connection)
        return Object.assign({}, genome, { [gene.innovation]: gene })
      }
    }
    return genome
  }
  
  structural(genome: Genome){
    return this.node(this.connection(genome))
  }

  weights(genome: Genome){
    return Object.keys(genome).reduce((mutated, innovation) => (
      mutated[innovation] = mutateWeight(genome[innovation]), mutated
    ), {})
  }

  mutate(genome: Genome){
    return this.weights(this.structural(genome))
  }

  initializeConnections(): Genome {
    let connections = this.context.connections
    return Object.keys(connections).reduce((init, innovation) => {
      init[innovation] = initializeConnection(connections[innovation])
      init[innovation].innovation = innovation
      return init
    }, {})
  }

  seed(size: number): Set<Genome> {
    let seed = this.initializeConnections()
    let genomes: Set<Genome> = Set()
    while (size--){
      genomes = genomes.add(this.mutate(seed))
    }
    return genomes
  }

}

