import { DeepRecord } from '../structures/deep-record'

export default DeepRecord({
  newNodeProbability: 0.03,
  newConnectionProbability: 0.05,
  connection: {
    disable: 0.00,
    reenable: 0.00,
    weightChange: {
      bounds: {
        minimum: -30,
        maximum: 30,
        bounce: true // if would cross the boundary, bounce back instead
      }, 
      probability: 0.9,
      power: 2.5
    },
    canBeRecurrent: false
    // recurrent: 0
  },
})
