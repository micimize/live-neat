import { Record } from 'immutable'

export const INPUT_VECTOR_SIZE = 2
export const OUTPUT_VECTOR_SIZE = 1

interface InnovationConfiguration {
  chronicle: {
    initialize: {
      inputs: number
      outputs: number
      opener: 'single-connection' | 'single-hidden-node' | 'fully-connected' | 'custom'
      activations: Array<string>
      // 'sigmoid', 'tanh', 'relu', 'gaussian', 'sin', 'cos', 'abs', 'mult', 'add', 'mult', 'add'
    },
    connections: {
      unique: true
    }
  }
}

const InnovationConfiguration = Record<InnovationConfiguration>({
  chronicle: {
    initialize: {
      inputs: INPUT_VECTOR_SIZE,
      outputs: OUTPUT_VECTOR_SIZE,
      opener: 'fully-connected',
      activations: [ 'sigmoid' ]
    },
    connections: {
      unique: true
    }
  }
})

export default InnovationConfiguration
