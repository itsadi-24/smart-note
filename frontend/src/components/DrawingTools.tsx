// components/DrawingTools.tsx
import { DrawingTool } from '@/types';

interface DrawingToolsProps {
  selectedTool: DrawingTool;
  onToolChange: (tool: DrawingTool) => void;
}

export default function DrawingTools({
  selectedTool,
  onToolChange,
}: DrawingToolsProps) {
  return (
    <div className='flex gap-2'>
      <button
        onClick={() => onToolChange('pen')}
        className={`px-3 py-1 rounded ${
          selectedTool === 'pen' ? 'bg-blue-500 text-white' : 'bg-gray-200'
        }`}
      >
        Pen
      </button>
      <button
        onClick={() => onToolChange('eraser')}
        className={`px-3 py-1 rounded ${
          selectedTool === 'eraser' ? 'bg-blue-500 text-white' : 'bg-gray-200'
        }`}
      >
        Eraser
      </button>
    </div>
  );
}
