import {
  BookOpen,
  MessageSquareQuote,
  Sparkles,
  Languages,
  GraduationCap,
  Lightbulb,
} from 'lucide-react';
import { motion } from 'framer-motion';

const ICONS = {
  BookOpen,
  MessageSquareQuote,
  Sparkles,
  Languages,
  GraduationCap,
  Lightbulb,
};

export default function SuggestionChip({ icon, label, onClick, index = 0 }) {
  const Icon = ICONS[icon] || Sparkles;
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      className="flex items-center gap-2 whitespace-nowrap rounded-full border border-cream-300 bg-cream-50 px-4 py-2.5 text-sm font-medium text-ink-700 shadow-soft transition-all hover:border-azure-300 hover:shadow-glow-blue dark:border-ink-800 dark:bg-surface-darkAlt dark:text-ink-50 dark:hover:border-gilt-400 dark:hover:shadow-glow-gold"
    >
      <Icon size={16} className="text-azure-500 dark:text-gilt-300" />
      {label}
    </motion.button>
  );
}
