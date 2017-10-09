
export default [

  'Population',
  'InnovationContext',
  'Mutator',
  'GeneExpresser',

  'Network',

].reduce((types, k) => {
  types[k] = Symbol(k)
  return types
}, {})


