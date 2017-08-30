import * as random from '../../random-utils'
import { ConnectionGene, signature, initializeConnection } from './connection-gene'
import Genome from './type'
import configurator from '../configurator'

function values(obj): any[] {
  return Object.keys(obj).map(k => obj[k])
}

function randomConnection(genome: Genome): ConnectionGene {
  return random.selection(values(genome))
}


function randomPotentialConnection(genome: Genome) { let signatures = new Set(values(genome).map(signature))
  let nodes = new Set(values(genome).reduce((nodes, { from, to }) => (
    nodes[from] = true, nodes[to] = true, nodes
  ), {}))
  for (let from of random.shuffle(Object.keys(nodes))) {
    for (let to of random.shuffle(Object.keys(nodes))) {
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

export default class Mutator {

  constructor(context: InnovationContext){
    this.context = context
  }

  node(genome: Genome){
    if (Math.random() < configurator().mutation.newNodeRate) {
      let connection = randomConnection(genome)
      let mutated = initializeNode(connection, context.insertNode(connection))
      Object.assign(genome, mutated)
    }
    return genome
  }

  connection(genome: Genome){
    if (Math.random() < configurator().mutation.newConnectionRate) {
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

  initializeConnections(){
    let connections = this.context.connection
    return Object.keys(connections).reduce(innovation => {
      init[innovation] = initializeConnection(connections[innovation])
      return init
    }, {})
  }

  seed(size: number): Genome {
    let seed = new Genome(this.initializeConnections())
    return new Set((new Array(size)).fill().map(this.mutate(seed)))
  }

}

