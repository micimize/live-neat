import InnovationContext from './innovation-context'
import GeneExpresser from './network/vanilla'
import { Mutator } from './genome'
import Population from './population'

export default function seed() {
  let context = new InnovationContext()
  return new Population(new Mutator(context), new GeneExpresser(context))
}
