import SortedSet, * as ss from './SortedSet'
import { size, filter } from '@collectable/sorted-set';

export type Concatable<A> = ss.Concatable<A> | CompetitiveSet<A>

export type Args<A> = { limit: number } & ss.Args<A>

export default class CompetitiveSet<A> extends SortedSet<A> {

  readonly limit: number

  constructor({ limit, values, comparator }: Args<A>)  {
    super({ values, comparator })
    this.limit = limit
  }

  culled(): CompetitiveSet<A>{
    let { limit, values, comparator } = this
    if(size(values) > limit){
      return new CompetitiveSet({
        limit,
        comparator,
        values: filter((value, rank) => rank < limit, values)
      })
    }
    else return this
  }

  concat(set: Concatable<A>): CompetitiveSet<A> {
    let { limit, comparator } = this
    return this.of({ limit, comparator, values: super.concat(set).values })
  }

  merge(set: A | Array<A> | SortedSet<A> | CompetitiveSet<A>): CompetitiveSet<A> {
    return this.concat(set)
  }

  static of<A>({ limit, values = [], comparator }: Args<A>): CompetitiveSet<A> {
    return new CompetitiveSet({ limit, values, comparator }).culled()
  }

  of(set: Partial<Args<A>>): CompetitiveSet<A> {
    let {
      limit = this.limit,
      values = this.values,
      comparator = this.comparator
    } = set
    return CompetitiveSet.of({ limit, values, comparator })
  }

  setLimit(limit: number = this.limit): CompetitiveSet<A> {
    let { values, comparator } = this
    return this.of({ limit, values, comparator })
  }

}

