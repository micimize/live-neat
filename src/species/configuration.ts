import { Record } from 'immutable'

function shouldBeRecord(value): boolean {
  return (typeof value == 'object') && !Array.isArray(value)
}
export function DeepRecord<T extends {}, S = keyof T>(raw: T): Record.Factory<T> {
  for (let key in raw){
    let value = raw[key]
    if(shouldBeRecord(value)){
      raw[key] = DeepRecord(value)()
    }
  }
  return Record(raw)
}

const speciation = {
  speciesCount: 4,
  heroCount: 10,
  stagnation: {
    acceptableGenerations: 20,
    cost: 10,
  },
  culling: {
    regularity: 30,
    minimumAge: 20
  },
  compatibility: {
    threshold: 20.0,
    modifier: 1,
    thresholdBounds: {
      minimum: 1,
      maximum: Infinity,
    }, 
    distance: {
      genome: {
        innovationDifferenceCoefficient: 2,
        weightDifferenceCoefficient: 1
      }
    }
  }
}

const SpeciationConfiguration = DeepRecord(speciation)
const def = SpeciationConfiguration()
type SpeciationConfiguration = typeof def

export default SpeciationConfiguration
