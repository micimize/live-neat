import { Set, Map } from 'immutable'
import { InnovationChronicle }  from '../innovation'
import { Genome, initialize  } from '../genome'
import { mutate } from './genome'
import Configuration from './configuration'

type SeedScope = {
  chronicle: InnovationChronicle,
  genome?: Genome,
  size: number,
  configuration: Configuration
}

function seed({
  chronicle,
  configuration,
  genome = Genome.of({ connections: initialize.connections(chronicle.connections) }),
  size
}: SeedScope 
): { chronicle: InnovationChronicle, genomes: Set<Genome> } {
  let genomes: Set<Genome> = Set()
  while (size-- > 0){
    ({ genome, chronicle } = mutate({ chronicle, genome, configuration }))
    genomes = genomes.add(genome)
  }
  return { chronicle, genomes }
}

export { seed }