import * as random from '../random-utils'
import configurator from './configurator'

interface Innovation {
  innovation: number
}

interface Node {
  activation: number
}

interface Connection {
  from: number,
  to: number,
}

export type NodeInnovation = Node & Innovation
export type ConnectionInnovation = Connection & Innovation
 

export interface InnovationMap<T> {
  [innovation: number]: T
}

type ActivationRef = 'sigmoid' | 'tanh' | 'relu'

interface Config {
  inputs: number,
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

export default class InnovationContext {

  innovation: number = 3;
  _activations = { 0: 'INPUT', 1: 'BIAS', 2: 'OUTPUT' };
  activations: InnovationMap<ActivationRef>;
  nodes: InnovationMap<Node>;
  connections: InnovationMap<Connection>;

  constructor(){
    let {
      inputs,
      outputs,
      opener = 'fully-connected',
      activations = ['sigmoid']
    } = configurator().initialNetwork
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

  getNodesOfType(nodeType): number[]{
    return Object.keys(this.nodes)
      .filter(k => this.nodes[k] === nodeType)
      .map(Number)
  }

  newNode(){
    let activation = random.selection(Object.keys(this.activations))
    let innovation = this.innovate('nodes', activation)
    return { innovation, activation }
  }

  newConnection({ from, to }: Connection){
    let innovation = this.innovate('connections', { from, to })
    return { from, to, innovation }
  }

  insertNode({ from, to }){
    let node = this.newNode()
    let newFrom = this.newConnection({ from, to: node.innovation })
    let newTo = this.newConnection({ from: node.innovation, to })
    return {
      [ newFrom.innovation ]: newFrom,
      [ newTo.innovation ]: newTo,
    }
  }

  fullyConnectedOpener(){
    let inputs = this.getNodesOfType('INPUT')
    let outputs = this.getNodesOfType('OUTPUT')
    inputs.forEach(from =>
      outputs.forEach(to =>
        this.newConnection({ from ,to })))
  }

}

