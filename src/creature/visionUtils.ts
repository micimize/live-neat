export function flattenRGBs(cells: any){
  return cells.reduce((rgbs: any, { color = [ 0, 0, 0 ] } = {}) =>
    [...rgbs, ...color ], [])
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
        cells.push({ color: [ null, null, null ] })
      }
      current.row++
      current.column++
    }
  }
  return cells
}
