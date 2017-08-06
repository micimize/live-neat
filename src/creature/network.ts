import * as R from '../ml/recurrent.js'
import { oneHotLayer } from '../ml/utils'

interface Decoder { (oneHot: number[]): any; outputSize?: number; }

function networkDecoder(options: object){
  let actionClasses = Object.keys(options)
  let layer = oneHotLayer(...actionClasses.map(c => options[c]))
  const decodeDecision: Decoder = (oneHot: number[]) => layer.decode(oneHot)
    .reduce((total, action, i) =>
      Object.assign(total, {[actionClasses[i]]: action }), {})
  decodeDecision.outputSize = layer.outputSize
  return decodeDecision
}


const decode = networkDecoder({
  action: [ 'push', 'pull', 'bite', null ],
  direction: [ 'right', 'left', 'up', 'down' ]
})


export const INPUT_VECTOR_SIZE = (3 + (5 * 5 * 3))
export const OUTPUT_VECTOR_SIZE = decode.outputSize

function toMatrix(array: number[]){
  let mat: any = new R.Mat(1, INPUT_VECTOR_SIZE)
  if (mat){
    mat.setFromArray([array])
  }
  return mat
}

export default function brain(genome){
  genome.setupModel(1)
  let G = new R.Graph(false);           // setup the recurrent.js graph without backprop
  function think(gameState: number[]) { // gameState is a flattened 5x5x3 array of color values
    let inputVector = toMatrix(gameState)
    genome.setInput(inputVector)          // put the input data into the network
    genome.forward(G)                   // propagates the network forward.
    return decode(genome.getOutput())   // get the output from the network
  }
  return think
}


