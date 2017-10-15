import configurator from '../configurator'
import { Record } from 'immutable'

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
  constructor({ from, to, weight, active }: Connection){
    super({ from, to , weight, active })
  }
  get signature(): string {
    return [this.from, this.to].sort().join(',')
  }
}

export function initializeConnection(gene: ConnectionInnovation): ConnectionGene {
  return Object.assign({
    active: true,
    weight: Math.random()
  }, gene)
}

