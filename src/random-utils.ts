function values(obj){
  return Object.keys(obj).map(k => obj[k])
}


export function shuffle(array: Array<any>) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex]; array[currentIndex] = array[randomIndex]; array[randomIndex] = temporaryValue; }

  return array;
}

export function subset(obj: object, size: number) {
  return shuffle(Object.keys(obj))
    .slice(0, size)
    .reduce((sub, key) => (sub[key] = obj[key], sub), {})
}

export function weightedChoice(weights): any {
  let scale = values(weights).reduce((total, weight) => total + weight, 0)
  let selector = Math.random()
  for (let choice in shuffle(Object.keys(weights))) {
    let weight = weights[choice] / scale
    if (weight > selector){
      return choice
    }
    rand -= weight
  }
}

export function selection(choices: Array<T>): T {
  var index = Math.floor(Math.random() * choices.length)
  return choices[index]
}

