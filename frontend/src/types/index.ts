// types/index.ts
export type DrawingTool = 'pen' | 'eraser';

export interface ColorSwatchProps {
  color: string;
  isSelected: boolean;
  onClick: () => void;
}
