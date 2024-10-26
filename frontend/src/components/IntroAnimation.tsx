import { motion } from 'framer-motion';
import { useState } from 'react';

interface IntroAnimationProps {
  onAnimationComplete: () => void;
}

export default function IntroAnimation({
  onAnimationComplete,
}: IntroAnimationProps) {
  const [isHovering, setIsHovering] = useState(false);

  // Random sparkle positions
  const [sparklePositions] = useState(() =>
    Array.from({ length: 15 }, () => ({
      x: Math.random() * 800 - 400,
      y: Math.random() * 800 - 400,
      scale: Math.random() * 0.5 + 0.5,
    }))
  );

  return (
    <motion.div
      className='fixed inset-0 bg-gradient-to-b from-[#1a1a1a] to-[#121212] z-50 flex items-center justify-center overflow-hidden'
      initial='initial'
      animate='animate'
      variants={{
        initial: { opacity: 1 },
        animate: {
          opacity: 0,
          transition: { duration: 0.7, delay: 3.8 },
        },
      }}
      onAnimationComplete={onAnimationComplete}
    >
      {/* Background Effects */}
      <motion.div
        className='absolute inset-0 opacity-30'
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 2 }}
      >
        {sparklePositions.map((pos, i) => (
          <motion.div
            key={i}
            className='absolute w-1 h-1 bg-white rounded-full'
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, pos.scale, 0],
              x: pos.x,
              y: pos.y,
            }}
            transition={{
              duration: 2,
              delay: i * 0.1,
              repeat: Infinity,
              repeatDelay: Math.random() * 2,
            }}
          />
        ))}
      </motion.div>

      <div className='relative'>
        {/* Orbiting Elements */}
        <motion.div className='absolute inset-0 flex items-center justify-center'>
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className='absolute w-5 h-5 rounded-full bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500'
              initial={{
                x: 0,
                y: 0,
                opacity: 0,
              }}
              animate={{
                x: Math.cos((i * Math.PI) / 3) * 130,
                y: Math.sin((i * Math.PI) / 3) * 130,
                opacity: [0, 1, 0],
                scale: [1, 1.4, 1],
                rotate: [0, 360],
              }}
              transition={{
                duration: 3,
                delay: i * 0.2,
                repeat: Infinity,
                repeatDelay: 1,
                ease: 'easeInOut',
              }}
            />
          ))}
        </motion.div>

        {/* Main Content */}
        <motion.div
          className='relative z-10 text-center'
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7 }}
          onHoverStart={() => setIsHovering(true)}
          onHoverEnd={() => setIsHovering(false)}
        >
          <motion.div
            className='text-8xl mb-8'
            animate={{
              rotate: [0, 12, -12, 0],
              scale: isHovering ? 1.3 : 1,
            }}
            transition={{
              duration: 1.2,
              ease: 'easeInOut',
            }}
          >
            ✨
          </motion.div>

          <motion.h1
            className='text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-white mb-6 font-heading tracking-tight'
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            transition={{ delay: 0.8 }}
          >
            Smart Note
          </motion.h1>

          <motion.div
            className='flex justify-center gap-8 text-white/70 text-2xl font-medium tracking-wide'
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            {['Draw', 'Analyse', 'Create'].map((text, index) => (
              <motion.span
                key={text}
                whileHover={{
                  scale: 1.1,
                  color: 'rgba(255, 255, 255, 0.9)',
                  textShadow: '0 0 8px rgba(255,255,255,0.5)',
                }}
                className='cursor-pointer transition-colors'
              >
                {text}
                {index < 2 && (
                  <span className='mx-8 text-white/30 select-none'>•</span>
                )}
              </motion.span>
            ))}
          </motion.div>

          {/* Additional decorative elements */}
          <motion.div
            className='absolute -z-10 inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl'
            initial={{ scale: 0 }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
            }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
