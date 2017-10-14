import configurator from '../configurator'

export function signature({ from, to }: PotentialConnection ): string {
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

export function select([ a, b ]: Array<ConnectionGene>){
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

export function mutateWeight({ weight, ...gene }: ConnectionGene): ConnectionGene {
  return Object.assign({ weight: weight + weightMutation() }, gene)
}

export function initializeConnection(gene: ConnectionInnovation): ConnectionGene {
  return Object.assign({
    active: true,
    weight: Math.random()
  }, gene)
}

