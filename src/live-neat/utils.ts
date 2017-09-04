
function LazyCartesianProduct(this: any, sets: any){
  // stolen from http://phrogz.net/lazy-cartesian-product
  for (var dm: any[] = [], f=1, l, i=sets.length; i--; f *= l){
    l = sets[i].length
    dm[i] = [ f, l ]
  }
  this.length = f;
  this.item = function(n){
    for (var c: any[] = [],i=sets.length;i--;)c[i]=sets[i][(n/dm[i][0]<<0)%dm[i][1]];
    return c;
  };
}

function indexOfMax(arr: number[]) {
  if (arr.length === 0) {
    return -1;
  }
  var max = arr[0]
  var maxIndex = 0
  for (var i = 1; i < arr.length; i++) {
    if (arr[i] > max) {
      maxIndex = i;
      max = arr[i];
    }
  }
  return maxIndex;
}

export function maxLayer(...actionLists: any[]){
  let product = new LazyCartesianProduct(actionLists)
  return {
    outputSize: product.length,
    decode(vector: any[]){
      return product.item(indexOfMax(vector))
    }
  }
}

interface Decoder { (oneHot: number[]): any; outputSize?: number; }

export function networkDecoder(options: object){
  let actionClasses = Object.keys(options)
  let layer = maxLayer(...actionClasses.map(c => options[c]))
  const decodeDecision: Decoder = (oneHot: number[]) => layer.decode(oneHot)
    .reduce((total, action, i) =>
      Object.assign(total, {[actionClasses[i]]: action }), {})
  decodeDecision.outputSize = layer.outputSize
  return decodeDecision
}

