export interface Cell {
  type: number;
  matched: boolean;
  key: string;
  isDropping: boolean;
  dropDelay?: number;
}

export interface Position {
  row: number;
  col: number;
}