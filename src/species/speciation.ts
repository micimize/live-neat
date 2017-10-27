import { SortedSet } from '../structures'
import { Creature, distance } from '../creature'
import { Species } from './species'
import Configuration from '../population/configuration'

function CompatibilityChecker({ compatibilityThreshold }: Configuration['speciation']) {
  // TODO dredge up old imperetive add code for this
  return function compatible(species, creature: Creature): boolean {
    return species.creatures.some(member =>
      distance([ member, creature ]) < compatibilityThreshold)
  }
}

function speciater(configuration: Configuration['speciation']){
  let compatible = CompatibilityChecker(configuration)
  return function speciate(species: SortedSet<Species>, creature: Creature): SortedSet<Species> {
    let speciated = false
    for (let s of species){
      if(compatible(s, creature)){
        return species.delete(s).concat(s.add(creature))
      }
    }
    return species.concat(Species.of({ creature }))
  }
}

export { speciater }