import { ConnectionInnovation } from '../innovation-context'
import configurator from '../configurator'

export interface ConnectionGene {
  from: number,
  to: number,
  innovation: number,
  weight: number,
  active: boolean,
  recurrent: boolean
}

export interface PotentialConnection {
  from: number,
  to: number
} 

export function signature({ from, to }: PotentialConnection ){
  return [ from, to ].sort().join(',')
}

export function connectionExpressionTracker(){
  let tracker: any = (connection: ConnectionGene): ConnectionGene | false => {
    let sig = signature(connection)
    if (seen.connections[sig]){
      return seen.connections[sig]
    } else {
      seen.connections[sig] = connection
      return false
    }
  }
  tracker.connections = {}
  let seen: {
    connections: { string: ConnectionGene },
    (connection: ConnectionGene): ConnectionGene | false
  } = tracker
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
  let { weightChange } = configurator().mutation
  return Math.random() < weightChange.probability ?
    (Math.random() * 2 - 1) * weightChange.power :
    0
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
    weight: Math.random()
  }, gene)
}


