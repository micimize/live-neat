import { Set, Map } from 'immutable'
import { InnovationChronicle }  from '../innovation'
import Genome from '../genome'
import { mutate } from './genome'
import { initializeConnections } from './initializers'

function seed({
  chronicle,
  genome = Genome.of({ connections: initializeConnections(chronicle.connections) }),
  size
}: { chronicle: InnovationChronicle, genome: Genome, size: number }
): { chronicle: InnovationChronicle, genomes: Set<Genome> } {
  let genomes: Set<Genome> = Set()
  while (size--){
    ({ genome, chronicle } = mutate({ chronicle, genome }))
    genomes = genomes.add(genome)
  }
  return { chronicle, genomes }
}

export { seed }