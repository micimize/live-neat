import { ConnectionInnovation } from './innovation-context'
import configurator from '../configurator'

export interface ConnectionGene {
  from: number,
  to: number,
  innovation: number,
  weight: number,
  active: boolean,
  recurrent: boolean
}

export function signature(connection: ConnectionGene){
  return [ connection.from, connection.to ].sort().join(',')
}

export function connectionExpressionTracker(){
  let seen = (connection: ConnectionGene) => {
    let sig = signature(connection)
    if (seen.connections[sig]){
      return seen.connections[sig]
    } else {
      seen.connections[sig] = connection
      return false
    }
  }
  seen.connections = {}
  return seen
}


export function select(a: ConnectionGene, b: ConnectionGene){
  if (!a.active){
    if (!b.active){
      return Math.random() > 0.50 ? a : b
    } else {
      return Math.random() > configurator().mutation.reenable ? a : b
    }
  } else { // if (a.active) {
    if (!b.active){
      return Math.random() > configurator().mutation.reenable ? b : a
    } else {
      return Math.random() > 0.50 ? a : b
    }
  }
}

function weightMutation(): number {
  let { linkWeight } = configurator().mutation
  Math.random() < linkWeight.rate ? R.randn(0, linkWeight.size) : 0
}

export function mutateWeight(gene: ConnectionGene) {
  // we need to clone genes anyways
  let rate = 0.2
  let size = 0.5
  return Object.assign({}, gene, {
    weight: gene.weight + weightMutation()
  })
}


export function initializeConnection(gene: ConnectionInnovation): ConnectionGene {
  return Object.assign({
    active: true,
    recurrent: false,
    weight: Math.random() * 10
  }, gene)
}


