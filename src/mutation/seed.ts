import { Set, Map } from 'immutable'
import { InnovationContext }  from '../innovation-context'
import Genome from '../genome'
import { mutate } from './genome'
import { initializeConnections } from './initializers'

function seed({
  context,
  genome = Genome.of({ connections: initializeConnections(context.connections) }),
  size
}: { context: InnovationContext, genome: Genome, size: number }
): { context: InnovationContext, genomes: Set<Genome> } {
  let genomes: Set<Genome> = Set()
  while (size--){
    ({ genome, context } = mutate({ context, genome }))
    genomes = genomes.add(genome)
  }
  return { context, genomes }
}

export { seed }