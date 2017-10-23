import { Map } from 'immutable'
import Genome, { ConnectionGenes } from '../genome'
import ConnectionGene, { PotentialConnection } from '../genome/connection-gene'

function initializeConnections(newConnections: Map<number, PotentialConnection>): ConnectionGenes {
  type Entry = [number, PotentialConnection]
  type GeneEntry = [number, ConnectionGene]
  return Map<number, ConnectionGene>(
    Array.from(newConnections.entries())
      .map(([innovation, connection]: Entry): GeneEntry =>
        [innovation, ConnectionGene.of({ innovation, ...connection })])
  )
}

function initializeNode(
  old: ConnectionGene,
  newConnections: Map<number, PotentialConnection>
): ConnectionGenes {
  return initializeConnections(newConnections)
    .set(old.innovation, old.set('active', false))
}

export { initializeConnections, initializeNode }