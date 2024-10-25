import { motion } from 'framer-motion';

export default function IntroAnimation({
  onAnimationComplete,
}: IntroAnimationProps) {
  return (
    <motion.div
      className='fixed inset-0 bg-[#1a1a1a] z-50 flex items-center justify-center'
      initial='initial'
      animate='animate'
      variants={{
        initial: { opacity: 1 },
        animate: {
          opacity: 0,
          transition: { duration: 0.5, delay: 3 },
        },
      }}
      onAnimationComplete={onAnimationComplete}
    >
      <div className='relative'>
        {/* Floating Elements */}
        <motion.div className='absolute inset-0 flex items-center justify-center'>
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className='absolute w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500'
              initial={{
                x: 0,
                y: 0,
                opacity: 0,
              }}
              animate={{
                x: Math.cos((i * Math.PI) / 3) * 100,
                y: Math.sin((i * Math.PI) / 3) * 100,
                opacity: [0, 1, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2,
                delay: i * 0.2,
                repeat: 0,
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
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className='text-7xl mb-6'
            animate={{
              rotate: [0, 10, -10, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 1,
              delay: 0.5,
              ease: 'easeInOut',
            }}
          >
            ✨
          </motion.div>

          <motion.h1
            className='text-4xl font-bold text-white mb-4'
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            Smart Calculator
          </motion.h1>

          <motion.div
            className='flex justify-center gap-4 text-white/60'
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <span>Draw</span>
            <span>•</span>
            <span>Calculate</span>
            <span>•</span>
            <span>Create</span>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
