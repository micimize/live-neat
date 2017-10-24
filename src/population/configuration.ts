import { Record } from 'immutable'
import Innovation from '../innovation/configuration'

const population = {
  initialSize: 50,
  minSize: 50,
  ageSignificance: 1,// / 5,
}

type PopulationConfiguration = { innovation: Innovation, population: typeof population }

const PopulationConfiguration = Record<PopulationConfiguration>({
  innovation: Innovation(),
  population
})

export default PopulationConfiguration 
