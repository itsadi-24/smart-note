import { FaLinkedin, FaGithub, FaGlobe, FaInfoCircle } from 'react-icons/fa';

interface TopButtonsProps {
  onInfoClick: () => void;
}

export default function TopButtons({ onInfoClick }: TopButtonsProps) {
  return (
    <div className='fixed top-6 left-8 flex gap-4 z-10'>
      <button
        onClick={onInfoClick}
        className='p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors'
        title='About this project'
      >
        <FaInfoCircle size={24} />
      </button>

      <a
        href='https://www.linkedin.com/in/adi-prasan-khuntia-3944072a5/'
        target='_blank'
        rel='noopener noreferrer'
        className='p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors'
        title='Connect on LinkedIn'
      >
        <FaLinkedin size={24} />
      </a>

      <a
        href='https://github.com/itsadi-24'
        target='_blank'
        rel='noopener noreferrer'
        className='p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors'
        title='View GitHub Profile'
      >
        <FaGithub size={24} />
      </a>

      <a
        href='https://adiprasan.me'
        target='_blank'
        rel='noopener noreferrer'
        className='p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors'
        title='Visit My Website'
      >
        <FaGlobe size={24} />
      </a>
    </div>
  );
}
