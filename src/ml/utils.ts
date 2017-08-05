
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

export function oneHotLayer(...actionLists: any[]){
  let product = new LazyCartesianProduct(actionLists)
  return {
    outputSize: product.length,
    decode(oneHot: number[]){
      return product.item(oneHot.indexOf(1))
    }
  }
}

