import InnovationContext, { InnovationMap } from '../innovation-context'
import * as random from '../../random-utils'
import { PotentialConnection, ConnectionGene, signature, initializeConnection, mutateWeight } from './connection-gene'
import Genome from './type'
import configurator from '../configurator'

function values(obj): any[] {
  return Object.keys(obj).map(k => obj[k])
}

function randomConnection(genome: Genome): ConnectionGene {
  return random.selection(values(genome))
}

function getNodes(genome: Genome): Set<number> {
  let nodes = new Set()
  values(genome).forEach(({ from, to }: PotentialConnection) => {
    nodes.add(from)
    nodes.add(to)
  })
  return nodes
}

function randomPotentialConnection(genome: Genome): PotentialConnection | void {
  let signatures = new Set(values(genome).map(signature))
  let nodes = getNodes(genome)
  for (let from of random.shuffle(Object.keys(nodes))) {
    for (let to of random.shuffle(Object.keys(nodes))) {
      if (from !== to && !signatures.has(signature({ from, to }))){
        return { from, to }
      }
    }
  }
}


function initializeNode(old: ConnectionGene, newConnections: InnovationMap<PotentialConnection>): Genome {
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
      Object.assign(genome, mutated)
    }
    return genome
  }

  connection(genome: Genome){
    if (Math.random() < configurator().mutation.newConnectionProbability) {
      let potentialConnection = randomPotentialConnection(genome)
      if (potentialConnection){
        let connection = this.context.newConnection(potentialConnection)
        let gene = initializeConnection(connection)
        genome[gene.innovation] = gene
      }
    }
    return genome
  }
  
  structural(genome: Genome){
    return this.node(this.connection(genome))
  }

  weights(genome: Genome){
    Object.keys(genome).forEach(innovation =>
      genome[innovation] = mutateWeight(genome[innovation]))
    return genome
  }

  mutate(genome: Genome){
    return this.weights(this.structural(Object.assign({}, genome)))
  }

  initializeConnections(): Genome {
    let connections = this.context.connections
    return Object.keys(connections).reduce((init, innovation) => {
      init[innovation] = initializeConnection(connections[innovation])
      return init
    }, {})
  }

  seed(size: number): Set<Genome> {
    let seed = this.initializeConnections()
    let genomes: Set<Genome> = new Set()
    while (size){
      genomes.add(this.mutate(seed))
      size--
    }
    return genomes
  }

}

