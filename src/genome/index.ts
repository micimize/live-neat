import Genome, { ConnectionGenes } from './genome'
import ConnectionGene from './connection-gene'

import distance from './distance'
import crossover from './crossover'

export default Genome
export type Genome = typeof Genome
export { distance, crossover, ConnectionGene, ConnectionGenes }