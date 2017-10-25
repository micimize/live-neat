import { SortedSet } from '../structures'
import { Creature } from '../creature'
import { Species } from '../species'

function speciate(species: SortedSet<Species>, creature: Creature): SortedSet<Species> {
  let speciated = false
  for (let s of species){
    if(s.compatible(creature)){
      return species.delete(s).concat(s.add(creature))
    }
  }
  return species.concat(Species.of({ creature }))
}

export { speciate }