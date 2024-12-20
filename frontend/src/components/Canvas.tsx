'use client';
import { useRef, useState, useEffect } from 'react';
import {
  FaPen,
  FaEraser,
  FaUndo,
  FaRedo,
  FaTrash,
  FaSearch,
  FaTimes,
  FaDownload,
} from 'react-icons/fa';
import Spinner from './Spinner';
import toast, { Toaster } from 'react-hot-toast';
import TopButtons from './TopButtons';
import InfoModal from './InfoModal';
import IntroAnimation from './IntroAnimation';
const COLORS = [
  '#FFFFFF', // default
  '#FF9B9B',
  '#B8FF9B',
  '#9BB8FF',
  '#FFE79B',
  '#FF9BE7',
  '#9BFFF6',
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
  const [error, setError] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [hasShownAlert, setHasShownAlert] = useState(false);
  // Use localStorage to check if it's the first visit
  // useEffect(() => {
  //   const hasVisited = localStorage.getItem('hasVisited');
  //   if (hasVisited) {
  //     setShowIntro(false);
  //   } else {
  //     localStorage.setItem('hasVisited', 'true');
  //   }
  // }, []);
  useEffect(() => {
    if (hasShownAlert) return;

    const timer = setTimeout(() => {
      toast(
        'Please note: The first request may take 1-2 minutes as the backend server starts up. Please refresh the page after waiting.Thanks for your patience!',
        {
          duration: 10000, // 10 seconds
          position: 'top-center',
          style: {
            background: '#1a1a1a',
            color: '#fff',
            borderRadius: '8px',
            padding: '16px',
            fontSize: '16px',
          },
        }
      );
      setHasShownAlert(true);
      // console.log('Toast shown');
    }, 15000);

    return () => clearTimeout(timer);
  }, [hasShownAlert]);
  const apiUrl =
    process.env.NODE_ENV === 'production'
      ? process.env.NEXT_PUBLIC_API_URL_PRODUCTION
      : process.env.NEXT_PUBLIC_API_URL_DEVELOPMENT;

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

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    contextRef.current = ctx;

    const handleResize = () => {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return;
      tempCtx.drawImage(canvas, 0, 0);

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      ctx.drawImage(tempCanvas, 0, 0);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      updateContextStyle(ctx);
      ctx.fillStyle = '#1a1a1a';
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const updateContextStyle = (ctx: CanvasRenderingContext2D) => {
    if (tool === 'eraser') {
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = lineWidth * 2;
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

  const stopDrawing = () => {
    if (!isDrawing) return;
    const ctx = contextRef.current;
    if (!ctx) return;

    ctx.closePath();
    setIsDrawing(false);

    setUndoStack((prev) => [
      ...prev,
      {
        type: 'path',
        points: currentPath,
        color: tool === 'eraser' ? '#1a1a1a' : selectedColor,
        lineWidth: tool === 'eraser' ? lineWidth * 2 : lineWidth,
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
    setError(null);
    toast.success('Canvas cleared!');
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      toast.error('Canvas not found');
      return;
    }

    try {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const ctx = tempCanvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }
      ctx.drawImage(canvas, 0, 0);

      const link = document.createElement('a');
      link.download = 'smart-calculator-drawing.png';
      link.href = tempCanvas.toDataURL('image/png');
      link.click();

      toast.success('Image downloaded successfully!');
    } catch (err) {
      console.error('Download error:', err);
      toast.error('Failed to download image');
    }
  };

  // In Canvas.tsx, modify the analyzeDrawing function:
  // const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/analyze`;
  // const apiUrl = 'http://localhost:8080';
  const analyzeDrawing = async () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      toast.error('Canvas not found');
      return;
    }

    if (!apiUrl) {
      toast.error('API URL not configured');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const imageData = canvas.toDataURL('image/png');
      console.log('Sending request to:', `${apiUrl}/analyze`);

      const response = await fetch(`${apiUrl}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageData }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data.result);
      toast.success('Analysis complete!');
    } catch (error: unknown) {
      console.error('Analysis error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to analyze drawing';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <>
      {showIntro && (
        <IntroAnimation onAnimationComplete={() => setShowIntro(false)} />
      )}
      <div
        className={`relative w-screen h-screen bg-[#1a1a1a] ${
          showIntro
            ? 'opacity-0'
            : 'opacity-100 transition-opacity duration-500'
        }`}
      >
        <Toaster position='top-center' />
        <TopButtons onInfoClick={() => setShowInfo(true)} />
        {showInfo && <InfoModal onClose={() => setShowInfo(false)} />}
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className='touch-none'
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
            title='Pen tool'
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
            title='Eraser tool'
          >
            <FaEraser />
          </button>

          <div className='h-6 w-px bg-white/20' />

          {COLORS.map((color) => (
            <button
              key={color}
              onClick={() => {
                setSelectedColor(color);
                setTool('pen');
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
            title='Line width'
          />

          <div className='h-6 w-px bg-white/20' />

          <button
            onClick={undo}
            disabled={undoStack.length === 0}
            className='p-2 text-white disabled:opacity-50 hover:bg-white/20 rounded-full'
            title='Undo'
          >
            <FaUndo />
          </button>
          <button
            onClick={redo}
            disabled={redoStack.length === 0}
            className='p-2 text-white disabled:opacity-50 hover:bg-white/20 rounded-full'
            title='Redo'
          >
            <FaRedo />
          </button>

          <div className='h-6 w-px bg-white/20' />

          <button
            onClick={downloadImage}
            className='p-2 text-white hover:bg-white/20 rounded-full'
            title='Download drawing'
          >
            <FaDownload />
          </button>

          <button
            onClick={clearCanvas}
            className='p-2 text-white hover:bg-white/20 rounded-full'
            title='Clear canvas'
          >
            <FaTrash />
          </button>

          <button
            onClick={analyzeDrawing}
            disabled={isAnalyzing}
            className={`px-4 py-2 ${
              isAnalyzing ? 'bg-gray-500' : 'bg-green-500 hover:bg-green-600'
            } text-white rounded-full flex items-center gap-2 transition-colors`}
          >
            {isAnalyzing ? <Spinner /> : <FaSearch />}
            {isAnalyzing ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>

        {/* Results display */}
        {(result || error) && (
          <div className='fixed top-8 left-1/2 transform -translate-x-1/2 bg-white/10 backdrop-blur-md rounded-lg p-6 max-w-lg w-full animate-fade-in'>
            <div className='flex justify-between items-start mb-4'>
              <h3 className='text-white font-semibold text-lg'>
                {error ? 'Error' : 'Analysis Result'}
              </h3>
              <button
                onClick={() => {
                  setResult('');
                  setError(null);
                }}
                className='text-white/60 hover:text-white transition-colors'
              >
                <FaTimes />
              </button>
            </div>

            <div
              className={`text-white ${
                error ? 'text-red-400' : ''
              } result-scrollbar max-h-[60vh] overflow-y-auto`}
            >
              {error || result}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
