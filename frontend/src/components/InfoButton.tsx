import { FaInfoCircle } from 'react-icons/fa';

interface InfoButtonProps {
  onClick: () => void;
}

export default function InfoButton({ onClick }: InfoButtonProps) {
  return (
    <button
      onClick={onClick}
      className='p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors'
      title='About this project'
    >
      <FaInfoCircle size={20} />
    </button>
  );
}
