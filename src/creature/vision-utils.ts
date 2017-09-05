export function flattenRGBs(cells: any){
  return cells.reduce((rgbs: any, { color = [ 255, 255, 255 ] } = {}) =>
    [...rgbs, ...color.map(c =>  c / 255.0) ], [])
}

export function getSurroundings({ board, position: { row, column }, range }: any){
  let cells: any[] = []
  let max = {
    row: row + range,
    column: column + range
  }
  let current = {
    row: row - range,
    column: column - range
  }
  while(current.row <= max.row){
    while(current.column <= max.column){
      if(board.isInBounds(current)){
        cells.push(board.getCell(current))
      } else {
        cells.push({ color: [ 0, 0, 0 ] })
      }
      current.column++
    }
    current.column = column - range
    current.row++
  }
  return cells
}
