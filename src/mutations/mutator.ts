import { Map } from 'immutable'
import { InnovationContext }  from '../innovation-context'
import * as random from '../random-utils'
import Genome, { ConnectionGenes } from '../genome'
import ConnectionGene, { PotentialConnection } from '../genome/connection-gene'
import configurator from '../configurator'
import { mutate } from './genome'

function initializeConnections(newConnections: Map<number, PotentialConnection>): ConnectionGenes{
  type Entry = [number, PotentialConnection]
  type GeneEntry = [number, ConnectionGene]
  return Map<number, ConnectionGene>(
    Array.from(newConnections.entries())
      .map(([innovation, connection]: Entry): GeneEntry =>
        [innovation, ConnectionGene.of({ innovation, ...connection })])
  )
}

function seed(
  context: InnovationContext,
  size: number,
  genome: Genome = Genome.of({ connections: initializeConnections(context.connections) }),
): Mutated & { genomes: Set<Genome> } {
  let genomes: Set<Genome> = Set()
  while (size--){
    let { genome: g, context: c } = mutate({ context, genome })
    context = c
    genomes = genomes.add(g)
  }
  return { context, genomes }
}


export { mutate, seed }