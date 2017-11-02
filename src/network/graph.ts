import { Set } from 'immutable'
import { ConnectionGene } from '../genome'

function connectedToOutput(outputs: Array<number>, connections: Array<ConnectionGene>){
  let traversed = Set(outputs).asMutable()
  // filter away connections until all that can connect to output are found
  let newlyDiscovered = true
  while (newlyDiscovered) {
    newlyDiscovered = false
    connections = connections.filter(({ from, to }) => {
      if(traversed.has(to) && traversed.has(from)){
        return false
      } if(traversed.has(to) && !traversed.has(from)){
        newlyDiscovered = true
        traversed.add(from)
        return false
      } else {
        return true
      }
    })
  }
  return traversed
}

// TODO copy pasted from above, the only difference here is from vs to, so obviously it should be generalized
function connectedToInput(inputs: Array<number>, connections: Array<ConnectionGene>){
  let traversed = Set(inputs).asMutable()
  // filter away connections until all that can connect to output are found
  let newlyDiscovered = true
  while (newlyDiscovered) {
    newlyDiscovered = false
    connections = connections.filter(({ from, to }) => {
      if(traversed.has(to) && traversed.has(from)){
        return false
        // begin change
      } if((!traversed.has(to)) && traversed.has(from)){
        newlyDiscovered = true
        traversed.add(to)
        // end change
        return false
      } else {
        return true
      }
    })
  }
  return traversed
}

export function connectedNodes({ inputs, outputs, connections }:
  {
    inputs: Array<number>,
    outputs: Array<number>,
    connections: Array<ConnectionGene>
}): Set<number> {
  let validInNodes  = connectedToInput(inputs, connections)
  let validOutNodes = connectedToOutput(outputs, connections)
  return validInNodes.intersect(validOutNodes)
}
