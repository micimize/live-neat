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

declare interface Connection extends ConnectionInnovation {
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

class ConnectionGene extends Record(empty) implements Connection {
  constructor({ from, to, weight = Math.random(), active = true }: Connection){
    super({ from, to , weight, active })
  }
  get signature(): string {
    return [this.from, this.to].join(',')
  }
  static of(innovation: ConnectionInnovation): ConnectionGene {
    return new ConnectionGene({ weight: Math.random(), active: true, ...innovation })
  }
}

export default ConnectionGene