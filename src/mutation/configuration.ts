import { Record } from 'immutable'

const mutation = {
  newNodeProbability: 0.01,
  newConnectionProbability: 0.3,
  connection: {
    newProbability: 0.3,
    disable: 0.01,
    reenable: 0.2,
    weightChange: {
      probability: 0.8,
      power: 1
    },
    // recurrent: 0
  },
}

type MutationConfiguration = typeof mutation

const MutationConfiguration = Record<MutationConfiguration>(mutation)

export default MutationConfiguration
