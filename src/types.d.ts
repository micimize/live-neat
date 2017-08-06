interface PiecePosition {
  row: number,
  column: number
}

interface PieceMovement {
  from: PiecePosition,
  to: PiecePosition
}

interface PieceBase {
  position: PiecePosition,
  color: [ number, number, number ],
  weight: number
}

interface Food extends PieceBase {
  energy: number,
  age: number
}

interface CreaturePiece extends Food {
  action?: 'push' | 'pull' | 'bite' | null ,
  direction?: 'right' | 'left' | 'up' | 'down' ,
  genome: any,
}

type Piece = PieceBase | Food | CreaturePiece

interface GameBoard {
  dimensions: { rows: number, columns: number },
  board: any,
  actors: Set<string>
}
