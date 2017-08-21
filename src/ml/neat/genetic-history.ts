interface NodeInnovation {
  activation: number
}

interface ConnectionInnovation {
  from: number,
  to: number,
}
interface GeneticHistoryInterface { innovation: number, nodes: Array<NodeInnovation>,
  connections: Array<ConnectionInnovation>
}

type ActivationRef = 'sigmoid' | 'tanh' | 'relu'
interface Config { inputs: number,
  outputs: number,
  opener: 'single-connection' | 'single-hidden-node' | 'fully-connected',
  activations: Array<ActivationRef>
  // 'sigmoid', 'tanh', 'relu', 'gaussian', 'sin', 'cos', 'abs', 'mult', 'add', 'mult', 'add'
}


/*
export type ActivationFunction = 'tanh'|'sin'|'relu'|'step';
const activationFunctionMap: {
  [activationFunction in ActivationFunction]: TODO WHAT
      (math: NDArrayMathGPU, ndarray: Array2D) => Array2D
} = {
  'tanh': (math: NDArrayMathGPU, ndarray: Array2D) => math.tanh(ndarray),
  'sin': (math: NDArrayMathGPU, ndarray: Array2D) => math.sin(ndarray),
  'relu': (math: NDArrayMathGPU, ndarray: Array2D) => math.relu(ndarray),
  'step': (math: NDArrayMathGPU, ndarray: Array2D) => math.step(ndarray)
};
*/

export default class GeneticHistory implements GeneticHistoryInterface {

  innovation: number = 3;
  _activations = { 0: 'INPUT', 1: 'BIAS', 2: 'OUTPUT' };
  activations: { [innovation: number]: ActivationRef };
  nodes: { [innovation: number]: NodeInnovation };
  connections: { [innovation: number]: ConnectionInnovation };

  constructor({ inputs, outputs, opener = 'fully-connected', activations = ['sigmoid'] }: Config){
    activations.forEach(a => this.innovate('activations', a))
    this.nNodesOfType(0, inputs)
    this.innovate('nodes', 1)
    this.nNodesOfType(2, outputs)
    if(opener === 'fully-connected'){
      this.fullyConnectedOpener()
    }
  }


  innovate(attribute: 'activations' | 'nodes' | 'connections', value){
    this[attribute][this.innovation++] = value
    return this.innovation
  }


  nNodesOfType(nodeType: number, count){
    while(count){
      this.innovate('nodes', nodeType)
      count--
    }
  }

  getNodesOfType(nodeType){
    return Object.keys(this.nodes).filter(k => this.nodes[k] === nodeType)
  }

  connect(from: number, to: number){
    this.innovate('connections', { from, to })
  }

  fullyConnectedOpener(){
    let inputs = this.getNodesOfType('INPUT')
    let outputs = this.getNodesOfType('OUTPUT')
    inputs.forEach(input =>
      outputs.forEach(this.connect(input, output)))
  }

  newNode(){
    let activation = choose(this.activations)
    let innovation = this.innovate('nodes', activation)
    return { innovation, activation }
  }

}

