import * as R from '../ml/recurrent.js'
import { oneHotLayer } from '../ml/utils'

function networkDecoder(options: object){
  let actionClasses = Object.keys(options)
  let layer = oneHotLayer(...actionClasses.map(c => options[c]))
  function decodeDecision(oneHot: number[]){
    return layer.decode(oneHot).reduce((total, action, i) =>
      Object.assign(total, {[actionClasses[i]]: action }), {})
  }
  return decodeDecision
}


const decode = networkDecoder({
  action: [ 'push', 'pull', 'bite', null ],
  direction: [ 'right', 'left', 'up', 'down' ]
})

export default function brain(genome){
  genome.setupModel(3 + (5 * 5 * 3))
  let G = new R.Graph(false);           // setup the recurrent.js graph without backprop
  function think(gameState: number[]) { // gameState is a flattened 5x5x3 array of color values
    genome.setInput(data)               // put the input data into the network
    genome.forward(G)                   // propagates the network forward.
    return decode(genome.getOutput())  // get the output from the network
  }
  return think
}


