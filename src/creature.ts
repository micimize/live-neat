import { Record  } from 'immutable'
import * as genome from './genome'
import { Network } from './network/network'
import { InnovationChronicle } from './innovation'
import { GeneExpresser, SimpleNetwork } from './network/vanilla'
import Configuration from './species/configuration'
import PopConfiguration from './population/configuration'


// TODO essentially hard coded
const defaultConf = PopConfiguration.creature

export function distance(
  configuration: Configuration['compatibility']['distance'],
  [ a, b ]: Array<Creature>
): number {
  return genome.distance(configuration.genome, [ a.genome, b.genome ])
}

// TODO awful, network inflexible, just hacking
let _genome = genome.Genome.empty()
let _chronicle = InnovationChronicle.empty()

const empty = {
  age: 0,
  energy: 0,
  genome: _genome,
  network: GeneExpresser({ chronicle: _chronicle })({
    chronicle: _chronicle,
    genome: _genome
  })
}

class Creature extends Record(empty) {

  get id(){
    return this.genome.id
  } 
  get fitness(){
    return this.genome.fitness
  }

  set fitness(fit: number){
    this.setIn(['genome', 'fitness'], fit)
  }

  age: number;
  energy: number;
  network: SimpleNetwork;

  constructor(creature: { genome: genome.Genome, network: SimpleNetwork }) {
    super(creature)
  }

  think(input){
    this.network.clear()
    return this.network.forward(input)
  }

  step(info: any, { ageSignificance }: PopConfiguration['creature'] = defaultConf): Creature {
    let { energy = 0 } = info
    return this.withMutations(creature => {
      // default fitness is average energy
      // increments age
      creature.setIn([ 'genome', 'fitness' ], (creature.fitness * creature.age + energy ) / creature.age + 1)
      creature.set('age', creature.age + 1)

      // default cost is the age * ageSignificance
      let cost = Math.floor(creature.age * ageSignificance)

      creature.set('energy', Math.max(creature.energy + energy - cost, 0))
    })
  }

  kill() {
  }

}

export { Creature }