import { motion, type HTMLMotionProps } from 'framer-motion';

export default function GlassCard({ children, className = '', ...props }: HTMLMotionProps<'div'> & { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03, boxShadow: '0px 0px 15px rgba(255,255,255,0.2)' }}
      whileTap={{ scale: 0.97 }}
      className={`glass-card ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
