import { Record } from 'immutable'
import * as random from '../random-utils'

interface PotentialConnection {
  from: number,
  to: number
} 

interface Connection extends PotentialConnection {
  weight: number,
  active: boolean
}

const empty = {
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
  static of(connection: PotentialConnection | Connection): ConnectionGene {
    return new ConnectionGene({ weight: random.within(-1, 1), active: true, ...connection })
  }
}

namespace ConnectionGene {
  export type Potential = PotentialConnection
}

export default ConnectionGene
export { PotentialConnection, ConnectionGene }