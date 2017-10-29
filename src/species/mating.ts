import { Species } from './species'
import { Genome, crossover } from '../genome'
import { weightedSelection, should } from '../random-utils'
import Configuration from '../population/configuration'

type GenePool = Array<Genome>
type PoolScope = {
  species: Species,
  reproduction: Configuration['reproduction'],
}
type MatingScope = PoolScope & {
  mutation: Configuration['mutation']
}


function selectElite({ species: { creatures }, reproduction }: PoolScope): GenePool {
  let eliteCount = Math.ceil(reproduction.survivalThreshold * creatures.size)
  return creatures.unwrap()
    .slice(0, eliteCount)
    .map(c => c.genome)
}

function genePool({ species, reproduction }: PoolScope): GenePool {
  let livingPool = selectElite({ species, reproduction })
  let heroes = species.heroes.map(
    g => g.set('fitness', reproduction.includeHeroGenesRate * g.fitness)
  ).unwrap()
  return livingPool.concat(heroes)
}

function selectHero(species: Species): Genome {
  return weightedSelection(species.heroes.unwrap(), g => g.fitness ** 2)
}

function selectGenome(pool: GenePool, { not }: { not?: Genome } = {}): Genome | void {
  pool = pool.filter(g => !g.equals(not))
  if (!pool.length) {
    return
  }
  // todo 0 fitness should probably be unselectable 
  return weightedSelection(pool, h => h.fitness ** 2)
}

function mate(scope: MatingScope): Genome {
  let pool = genePool(scope)
  let a = selectGenome(pool)
  if (!a) {
    /* TODO should be configurable
     * if there are no creatures, resurrect hero
     * this might not be as buggy as it seems -
     * the first dead creature will always be in the hero list.
     */
    return selectHero(scope.species)
  }
  let b = selectGenome(pool, { not: a })
  if (!b || should(scope.reproduction.kinds.asexual)) {
    return a
  }
  // TODO this is some weak and hacky DI
  return crossover(scope.mutation)([a, b])
}

export { mate }