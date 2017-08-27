import * as random from 'random-utils'
import { ConnectionGene, signature, initializeConnection } from './connection-gene'


function randomConnection(genome: Genome): ConnectionGene {
  return random.selection(Object.values(genome))
}


function randomPotentialConnection(genome: Genome) {
  let signatures = new Set(Object.values(genome).map(signature))
  let nodes = new Set(Object.values(genome).reduce((nodes, { from, to }) => (
    nodes[from] = true, nodes[to] = true, nodes
  ), {}))
  for (let from of random.shuffle(Object.keys(nodes)) {
    for (let to of random.shuffle(Object.keys(nodes)) {
      if (from !== to && !signatures.has(signature)){
        return { from, to }
      }
    }
  }
}


function initializeNode(old: ConnectionGene, newConnections: Genome): Genome {
  let mutation = Object.keys(newConnections).reduce((m, innovation) => (
    m[innovation] = initializeConnection(newConnections[innovation]), m
  ), {})
  old.active = false
  mutation[old.innovation] = old
  return mutation
}

interface Configuration {
  newNodeRate: number,
  newConnectionRate: number,
}

export default class Mutator {
  configuration: Configuration

  constructor(props: { context: InnovationContext, configuration: Configuration }){
    Object.assign(this, props)
  }

  node(genome: Genome){
    if (Math.random() < this.configuration.newNodeRate) {
      let connection = randomConnection(genome)
      let mutated = initializeNode(connection, context.insertNode(connection))
      Object.assign(genome, mutated)
    }
    return genome
  }

  connection(genome: Genome){
    if (Math.random() < this.configuration.newConnectionRate) {
      let potentialConnection = randomPotentialConnection(genome)
      let connection = this.context.newConnection(potentialConnection)
      let gene = initializeConnection(connection)
      genome[gene.innovation] = gene
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
    return this.weights(this.structural(genome))
  }

}

