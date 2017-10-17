import { Record } from 'immutable'
//import configuration from './configuration'

interface PotentialConnection {
  from: number,
  to: number
} 

declare interface Innovation {
  innovation: number
}

type ConnectionInnovation = PotentialConnection & Innovation

declare interface ConnectionGene extends ConnectionInnovation {
  weight: number,
  active: boolean
}

const empty = {
  innovation: NaN,
  from: NaN,
  to: NaN,
  weight: 0,
  active: false
} 

export class Connection extends Record(empty) implements ConnectionGene {
  constructor({ from, to, weight = Math.random(), active = true }: ConnectionGene){
    super({ from, to , weight, active })
  }
  get signature(): string {
    return [this.from, this.to].join(',')
  }
  static of(innovation: ConnectionInnovation): Connection {
    return new Connection({ weight: Math.random(), active: true, ...innovation })
  }
}

export function initializeConnection(gene: ConnectionInnovation): ConnectionGene {
  return new ConnectionGene(gene)
}

