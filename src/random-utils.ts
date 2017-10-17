import { Map, Set } from 'immutable'

export function shuffle(_array: Array<any>): Array<any> {
  // Fisher-Yates Shuffle
  let array = [..._array] 
  let counter = array.length

  while (counter > 0) {
    let index = Math.floor(Math.random() * counter)

    counter--

    // And swap the last element with it
    let temp = array[counter]
    array[counter] = array[index]
    array[index] = temp
  }

  return array
}

export function subset(obj: object, size: number) {
  return shuffle(Object.keys(obj))
    .slice(0, size)
    .reduce((sub, key) => (sub[key] = obj[key], sub), {})
}

export function submap<K, V>(map: Map<K, V>, size: number): Map<K, V> {
  return shuffle(Array.from(map.keys()))
    .slice(0, size)
    .reduce((sub, key) => sub.set(key,map.get(key)), Map())
}

export function weightedChoice(weights: { [choice: string]: number }): string {
  let scale = Object.keys(weights).reduce((total, k) => total + (weights[k] || 0), 0)
  let selector = Math.floor(Math.random() * scale)
  let weightSum = 0
  for (let choice of shuffle(Object.keys(weights))) {
    weightSum += weights[choice] || 0
    if (weightSum >= selector){
      return choice
    }
  }
  throw Error('weights somehow invalid')
}


export function weightedSelection<T>(
  choices: Array<T>,
  weigh: (choice: T) => number
): T {

  let { weights, scale } = choices.reduce(
    ({ weights, scale }, choice, index) => (
      weights[index] = weigh(choice),
      scale += weights[index],
      { weights, scale }
    ),
    <{ weights: Array<number>, scale: number }>{ weights: [] , scale: 0 }
  )

  let selector = Math.random() * scale

  for(let index = 0; index < weights.length; index++){
    selector -= weights[index]
    if (selector <= 0){
      return choices[index]
    }
  }
  throw Error('weights somehow invalid')
}


export function selection<T>(choices: Array<T>): T {
  var index = Math.floor(Math.random() * choices.length)
  return choices[index]
}

