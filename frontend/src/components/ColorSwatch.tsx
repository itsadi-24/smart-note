// components/ColorSwatch.tsx
import { ColorSwatchProps } from '@/types';

export default function ColorSwatch({
  color,
  isSelected,
  onClick,
}: ColorSwatchProps) {
  return (
    <button
      onClick={onClick}
      className={`w-8 h-8 rounded-full border-2 ${
        isSelected ? 'border-blue-500' : 'border-gray-300'
      }`}
      style={{ backgroundColor: color }}
      aria-label={`Select ${color} color`}
    />
  );
}
