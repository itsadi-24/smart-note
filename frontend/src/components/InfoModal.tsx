import { FaTimes } from 'react-icons/fa';

interface InfoModalProps {
  onClose: () => void;
}

export default function InfoModal({ onClose }: InfoModalProps) {
  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
      <div className='bg-[#2a2a2a] rounded-xl max-w-2xl w-full max-h-[80vh] relative animate-fade-in shadow-2xl flex flex-col'>
        {/* Fixed Header */}
        <div className='p-6 border-b border-white/10'>
          <button
            onClick={onClose}
            className='absolute top-6 right-6 text-white/60 hover:text-white transition-colors'
          >
            <FaTimes size={24} />
          </button>
          <h2 className='text-white text-3xl font-bold'>✨ Smart Note</h2>
        </div>

        {/* Scrollable Content */}
        <div className='overflow-y-auto p-6 custom-scrollbar'>
          <div className='text-white/90 space-y-6 text-lg'>
            <div>
              <p className='text-xl mb-3'>🎨 Draw, Analyze, Create!</p>
              <p className='text-white/80'>
                Welcome to your intelligent digital workspace! This smart note
                brings your handwritten notes to life. ✍️
              </p>
            </div>

            <div>
              <p className='text-xl mb-3'>🚀 What Can It Do?</p>
              <ul className='list-none space-y-3 text-white/80'>
                <li>📊 Solve mathematical equations instantly</li>
                <li>🎯 Interpret sketches and diagrams</li>
                <li>📝 Understand handwritten text</li>
                <li>🧮 Provide step-by-step solutions</li>
              </ul>
            </div>

            <div>
              <p className='text-xl mb-3'>🛠️ Available Tools</p>
              <div className='grid grid-cols-2 gap-4 text-white/80'>
                <ul className='list-none space-y-3'>
                  <li>🖊️ Smart Pen with Color Options</li>
                  <li>⚡ Quick Eraser</li>
                  <li>↔️ Adjustable Line Width</li>
                </ul>
                <ul className='list-none space-y-3'>
                  <li>↩️ Undo/Redo Actions</li>
                  <li>🗑️ Clear Canvas</li>
                  <li>💾 Download Your Work</li>
                </ul>
              </div>
            </div>

            <div>
              <p className='text-xl mb-3'>🎯 How to Use</p>
              <ol className='list-decimal pl-5 space-y-2 text-white/80'>
                <li>Draw or write your math problem on the canvas</li>
                <li>Click the &apos;Analyze&apos; button</li>
                <li>Get instant results and explanations!</li>
              </ol>
            </div>

            <div className='bg-white/5 rounded-lg p-6'>
              <p className='text-xl mb-4'>💡 Pro Tips</p>
              <ul className='list-none space-y-3 text-white/80'>
                <li>🎨 Use different colors to organize your work</li>
                <li>📏 Write clearly for better recognition</li>
                <li>🔄 Use undo/redo for quick corrections</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Fixed Footer */}
        <div className='border-t border-white/10 p-6'>
          <p className='text-white/60 flex items-center gap-2 justify-center'>
            Created with 💖 by Adi
          </p>
          <div className='flex justify-center gap-4 mt-4'>
            <a
              href='https://github.com/itsadi-24'
              target='_blank'
              rel='noopener noreferrer'
              className='text-blue-400 hover:text-blue-300 transition-colors'
            >
              GitHub
            </a>
            <span className='text-white/30'>•</span>
            <a
              href='https://adiprasan.me'
              target='_blank'
              rel='noopener noreferrer'
              className='text-blue-400 hover:text-blue-300 transition-colors'
            >
              Portfolio
            </a>
            <span className='text-white/30'>•</span>
            <a
              href='https://www.linkedin.com/in/adi-prasan-khuntia-3944072a5/'
              target='_blank'
              rel='noopener noreferrer'
              className='text-blue-400 hover:text-blue-300 transition-colors'
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
