export interface Cell {
  type: number;
  matched: boolean;
  key: string;
  isDropping: boolean;
}

export interface Position {
  row: number;
  col: number;
}