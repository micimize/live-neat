
function Ofable<Type extends { new (...args: any[]): {} }>(constructor: Type){
  return class Ofable extends constructor {
    static of(...args: any[]): Ofable {
      return new this(...args)
    }
  }
}