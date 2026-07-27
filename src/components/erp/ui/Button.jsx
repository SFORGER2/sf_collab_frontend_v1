import { motion } from 'framer-motion';

export const Button = ({ children, variant = 'primary', size = 'md', className, ...props }) => {
  const base = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-white text-black hover:bg-gray-200',
    secondary: 'bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    success: 'bg-green-600 text-white hover:bg-green-700',
    outline: 'border border-zinc-700 text-zinc-300 hover:bg-zinc-800',
    ghost: 'text-zinc-400 hover:text-white hover:bg-zinc-800',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};