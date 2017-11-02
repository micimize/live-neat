import { Set } from 'immutable'
import { Creature, distance } from '../creature'
import { Species } from './species'
import Configuration from '../population/configuration'


function CompatibilityChecker({ compatibility }: Configuration['speciation']) {
  // TODO dredge up old imperetive add code for this
  return function compatible(species, creature: Creature): boolean {
    return species.creatures.some(member =>
      distance(compatibility.distance, [ member, creature ]) < compatibility.threshold)
  }
}

function speciate(
  configuration: Configuration['speciation'],
  species: Set<Species>,
  creature: Creature
): Set<Species> {
  let compatible = CompatibilityChecker(configuration)
  let speciated = false
  for (let s of species){
    if(compatible(s, creature)){
      // TODO maybe addIn or something
      return species.remove(s).add(s.add(creature))
    }
  }
  return species.add(Species.of({ creature }))
}

const _speciate: typeof speciate = speciate

namespace speciate {
  export function curry(configuration: Configuration['speciation']){
    return (species: Set<Species>, creature: Creature) =>
      _speciate(configuration, species, creature)
  }
}

export { speciate }