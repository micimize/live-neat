import InnovationContext from './innovation-context'
import { Mutator } from './genome'
import Population from './population'

export default function seed() {
   return new Population(new Mutator(new InnovationContext()))
}
