import { Map } from 'immutable'
import { Genome, ConnectionGenes } from './genome'
import ConnectionGene, { PotentialConnection } from './connection-gene'

function connections(newConnections: Map<number, PotentialConnection>): ConnectionGenes {
  type Entry = [number, PotentialConnection]
  type GeneEntry = [number, ConnectionGene]
  return Map<number, ConnectionGene>(
    Array.from(newConnections.entries())
      .map(([innovation, connection]: Entry): GeneEntry =>
        [innovation, ConnectionGene.of(connection)])
  )
}

function node(
  old: { innovation: number, connection: ConnectionGene },
  newConnections: Map<number, PotentialConnection>
): ConnectionGenes {
  return connections(newConnections)
    .set(old.innovation, old.connection.set('active', false))
}

export { connections, node }