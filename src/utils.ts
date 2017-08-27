export function shuffle(array: Array<any>) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

export function weightedChoice(weights) {
  let scale = Object.values(weights).reduce((total, weight) => total + weight, 0)
  let selector = Math.random()
  for (let choice in shuffle(Object.keys(weights))) {
    let weight = weights[choice] / scale
    if (weight > selector){
      return choice
    }
    rand -= weight
  }
}

export function choose(choices: Array<any>) {
  var index = Math.floor(Math.random() * choices.length)
  return choices[index]
}

