import * as random from './random-utils'
import configurator from './configurator'

type ActivationRef = 'sigmoid' | 'tanh' | 'relu'

interface Config {
  inputs: number,
  outputs: number,
  opener: 'single-connection' | 'single-hidden-node' | 'fully-connected' | 'custom',
  activations: Array<ActivationRef>
  // 'sigmoid', 'tanh', 'relu', 'gaussian', 'sin', 'cos', 'abs', 'mult', 'add', 'mult', 'add'
}

function fromEntries(entries: Array<[any, any]>): object {
  return entries.reduce((o, [k, v]) => (o[k] = v, o), {})
}

export default class InnovationContext {

  innovation: number = 2;
  _activations: {
    0: 'INPUT',
    1: 'BIAS',
  }
  activations: InnovationMap<ActivationRef> = {};
  nodes: InnovationMap<PotentialNode> = {}; // [ nodeType, activation ]
  connections: InnovationMap<PotentialConnection> = {};

  get hiddenNodes(){
    let exposedActivations = Object.values(this._nodeTypeEnum)
    return fromEntries(
      Object.entries(this.nodes).filter(([id, activation]) =>
        !exposedActivations.includes(activation)
      )
    )
  }

  constructor({
    inputs, outputs, opener = 'fully-connected', activations = ['sigmoid']
  } = configurator().initialNetwork){

    activations.forEach(a => this.innovate('activations', a))

    this.nNodes({ type: 'INPUT', activation: 0 }, inputs)
    this.nNodes({ type: 'BIAS', activation: 1 }, bias)
    // hardcoded: output is first activation
    this.nNodes({ type: 'OUTPUT', activation: 2 }, output) 

    if (opener === 'fully-connected') {
      this.fullyConnectedOpener()
    }

  }


  innovate(attribute: 'activations' | 'nodes' | 'connections', value){
    this[attribute][++this.innovation] = value
    return this.innovation
  }


  nNodes({ type, activation }, count){
    while(count){
      this.innovate('nodes', { type, activation })
      count--
    }
  }

  getNodesOfType(nodeType: number | string): number[]{
    nodeType = typeof(nodeType) === 'string' ? this._nodeTypeEnum[nodeType] : nodeType
    return Object.keys(this.nodes)
      .filter(k => this.nodes[k] === nodeType)
      .map(Number)
  }

  newNode(){
    let activation = random.selection(Object.keys(this.activations))
    let innovation = this.innovate('nodes', activation)
    return { innovation, activation }
  }

  newConnection({ from, to }: PotentialConnection){
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

