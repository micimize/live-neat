import SortedSet, { Args as SSArgs } from './SortedSet'
import { size, filter } from '@collectable/sorted-set';


export type Args<A> = { limit: number } & SSArgs<A>

export default class CompetitiveSet<A> extends SortedSet<A> {

  readonly limit: number

  constructor({ limit, ...args }: Args<A>)  {
    super(args)
    this.limit = limit
  }

  culled(): CompetitiveSet<A>{
    let { limit, values } = this
    if(size(values) > limit){
      return new CompetitiveSet({ values: filter((value, rank) => rank < limit, values), limit })
    }
    else return this
  }

  concat(set: A | Array<A> | SortedSet<A> | CompetitiveSet<A>): CompetitiveSet<A> {
    return this.of({ limit: this.limit, values: super.concat(set).values })
  }

  merge(set: A | Array<A> | SortedSet<A> | CompetitiveSet<A>): CompetitiveSet<A> {
    return this.concat(set)
  }

  static of<A>({ limit, values = [], ...args }: Args<A> ): CompetitiveSet<A> {
    return new CompetitiveSet({ limit, values, ...args }).culled()
  }

  get of() {
    return CompetitiveSet.of
  }

  empty(): SortedSet<A> {
    return SortedSet.of<A>()
  }

  setLimit(limit: number = this.limit): CompetitiveSet<A> {
    return this.of({ limit, values: this.values })
  }

}

