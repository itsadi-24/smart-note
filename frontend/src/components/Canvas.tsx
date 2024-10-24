'use client';
import { useRef, useState, useEffect } from 'react';
import {
  FaPen,
  FaEraser,
  FaUndo,
  FaRedo,
  FaTrash,
  FaSave,
  FaSearch,
} from 'react-icons/fa';

const COLORS = [
  '#FFFFFF', // white for blackboard
  '#FF9B9B', // soft red
  '#B8FF9B', // soft green
  '#9BB8FF', // soft blue
  '#FFE79B', // soft yellow
  '#FF9BE7', // soft pink
  '#9BFFF6', // soft cyan
];

interface DrawAction {
  type: 'path';
  points: { x: number; y: number }[];
  color: string;
  lineWidth: number;
}

export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [lineWidth, setLineWidth] = useState(3);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>(
    []
  );
  const [undoStack, setUndoStack] = useState<DrawAction[]>([]);
  const [redoStack, setRedoStack] = useState<DrawAction[]>([]);
  const [result, setResult] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    updateContextStyle(ctx);

    // Set black background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    contextRef.current = ctx;
  }, []);

  // Update context style based on current tool
  const updateContextStyle = (ctx: CanvasRenderingContext2D) => {
    if (tool === 'eraser') {
      ctx.strokeStyle = '#1a1a1a'; // Same as background color
      ctx.lineWidth = lineWidth * 2; // Bigger eraser
    } else {
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = lineWidth;
    }
  };

  useEffect(() => {
    if (contextRef.current) {
      updateContextStyle(contextRef.current);
    }
  }, [tool, selectedColor, lineWidth]);

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x =
      'touches' in e
        ? e.touches[0].clientX - rect.left
        : (e as React.MouseEvent).clientX - rect.left;
    const y =
      'touches' in e
        ? e.touches[0].clientY - rect.top
        : (e as React.MouseEvent).clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    setCurrentPath((prev) => [...prev, { x, y }]);
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas || !contextRef.current) return;

    const rect = canvas.getBoundingClientRect();
    const x =
      'touches' in e
        ? e.touches[0].clientX - rect.left
        : (e as React.MouseEvent).clientX - rect.left;
    const y =
      'touches' in e
        ? e.touches[0].clientY - rect.top
        : (e as React.MouseEvent).clientY - rect.top;

    contextRef.current.beginPath();
    contextRef.current.moveTo(x, y);
    setIsDrawing(true);
    setCurrentPath([{ x, y }]);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    const ctx = contextRef.current;
    if (!ctx) return;

    ctx.closePath();
    setIsDrawing(false);

    // Add to undo stack
    setUndoStack((prev) => [
      ...prev,
      {
        type: 'path',
        points: currentPath,
        color: selectedColor,
        lineWidth: lineWidth,
      },
    ]);
    setRedoStack([]);
  };

  const undo = () => {
    if (undoStack.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    if (!canvas || !ctx) return;

    const lastAction = undoStack[undoStack.length - 1];
    setRedoStack((prev) => [...prev, lastAction]);
    setUndoStack((prev) => prev.slice(0, -1));

    // Redraw everything
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    undoStack.slice(0, -1).forEach((action) => {
      ctx.beginPath();
      ctx.strokeStyle = action.color;
      ctx.lineWidth = action.lineWidth;

      action.points.forEach((point, i) => {
        if (i === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      });
      ctx.stroke();
      ctx.closePath();
    });
  };

  const redo = () => {
    if (redoStack.length === 0) return;

    const ctx = contextRef.current;
    if (!ctx) return;

    const actionToRedo = redoStack[redoStack.length - 1];
    setUndoStack((prev) => [...prev, actionToRedo]);
    setRedoStack((prev) => prev.slice(0, -1));

    ctx.beginPath();
    ctx.strokeStyle = actionToRedo.color;
    ctx.lineWidth = actionToRedo.lineWidth;

    actionToRedo.points.forEach((point, i) => {
      if (i === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.stroke();
    ctx.closePath();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    if (!canvas || !ctx) return;

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setUndoStack([]);
    setRedoStack([]);
    setResult('');
  };

  const analyzeDrawing = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsAnalyzing(true);
    try {
      const imageData = canvas.toDataURL('image/png');

      const response = await fetch('http://localhost:8080/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageData }),
      });

      const data = await response.json();
      setResult(data.result);
    } catch (error) {
      console.error('Error analyzing image:', error);
      setResult('Error analyzing image. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className='relative w-screen h-screen bg-[#1a1a1a]'>
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        className='touch-none w-screen h-screen'
      />

      {/* Floating toolbar */}
      <div className='fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white/10 backdrop-blur-md rounded-full p-4 flex items-center gap-4'>
        <button
          onClick={() => setTool('pen')}
          className={`p-2 rounded-full ${
            tool === 'pen'
              ? 'bg-blue-500 text-white'
              : 'text-white hover:bg-white/20'
          }`}
        >
          <FaPen />
        </button>
        <button
          onClick={() => setTool('eraser')}
          className={`p-2 rounded-full ${
            tool === 'eraser'
              ? 'bg-blue-500 text-white'
              : 'text-white hover:bg-white/20'
          }`}
        >
          <FaEraser />
        </button>

        <div className='h-6 w-px bg-white/20' />

        {COLORS.map((color) => (
          <button
            key={color}
            onClick={() => {
              setSelectedColor(color);
              setTool('pen'); // Switch back to pen when color is selected
            }}
            className={`w-8 h-8 rounded-full ${
              selectedColor === color && tool === 'pen'
                ? 'ring-2 ring-blue-500'
                : ''
            }`}
            style={{ backgroundColor: color }}
          />
        ))}

        <div className='h-6 w-px bg-white/20' />

        <input
          type='range'
          min='1'
          max='20'
          value={lineWidth}
          onChange={(e) => setLineWidth(Number(e.target.value))}
          className='w-32'
        />

        <div className='h-6 w-px bg-white/20' />

        <button
          onClick={undo}
          disabled={undoStack.length === 0}
          className='p-2 text-white disabled:opacity-50 hover:bg-white/20 rounded-full'
        >
          <FaUndo />
        </button>
        <button
          onClick={redo}
          disabled={redoStack.length === 0}
          className='p-2 text-white disabled:opacity-50 hover:bg-white/20 rounded-full'
        >
          <FaRedo />
        </button>

        <div className='h-6 w-px bg-white/20' />

        <button
          onClick={clearCanvas}
          className='p-2 text-white hover:bg-white/20 rounded-full'
        >
          <FaTrash />
        </button>
        <button
          onClick={analyzeDrawing}
          disabled={isAnalyzing}
          className='px-4 py-2 bg-green-500 text-white rounded-full flex items-center gap-2'
        >
          <FaSearch />
          {isAnalyzing ? 'Analyzing...' : 'Analyze'}
        </button>
      </div>

      {/* Results display */}
      {result && (
        <div className='fixed top-8 left-1/2 transform -translate-x-1/2 bg-white/10 backdrop-blur-md rounded-lg p-4 max-w-lg w-full'>
          <div className='text-white'>{result}</div>
        </div>
      )}
    </div>
  );
}
