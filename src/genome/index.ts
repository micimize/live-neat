import Mutator from './mutator'
import distance from './distance'
import Genome, { crossover } from './genome'

export default Genome
export type Genome = typeof Genome

export { Mutator, distance, crossover }
