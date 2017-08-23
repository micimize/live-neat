export interface ConnectionGene {
  from: number,
  to: number,
  innovation: number,
  weight: number,
  active: boolean
}

export function connectionExpressionTracker(){
  let seen = (connection: ConnectionGene) => {
    let sig = [ connection.from, connection.to ].sort().join(',')
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

function arbitrary(a: ConnectionGene, b: ConnectionGene){
  return Math.random() > 0.50 ? a : b
}

function weightedLeft(a: ConnectionGene, b: ConnectionGene){
  return Math.random() > 0.75 ? a : b
}

export function select(a: ConnectionGene, b: ConnectionGene){
  if (!a.active){
    if (!b.active){
      return arbitrary(a, b)
    } else {
      return weightedLeft(a, b)
    }
  } else { // if (a.active) {
    if (!b.active){
      return weightedLeft(b, a)
    } else {
      return arbitrary(a, b)
    }
  }
}


