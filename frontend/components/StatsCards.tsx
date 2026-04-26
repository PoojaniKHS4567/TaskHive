'use client';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiClock, FiTrendingUp, FiXCircle } from 'react-icons/fi';

interface Stats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
}

interface StatsCardsProps {
  stats: Stats;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: 'Total Tasks',
      value: stats.total,
      icon: FiTrendingUp,
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      delay: 0,
    },
    {
      title: 'Completed',
      value: stats.completed,
      icon: FiCheckCircle,
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      delay: 0.1,
    },
    {
      title: 'Pending',
      value: stats.pending,
      icon: FiClock,
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-600',
      delay: 0.2,
    },
    {
      title: 'Overdue Tasks',
      value: stats.overdue || 0,
      icon: FiXCircle,
      bgColor: 'bg-red-100',
      textColor: 'text-red-600',
      delay: 0.3,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: card.delay }}
          className="card p-4 hover:scale-105 transition-transform cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">{card.title}</p>
              <p className="text-3xl font-bold text-gray-900">{card.value}</p>
            </div>
            <div className={`${card.bgColor} p-3 rounded-full`}>
              <card.icon className={`h-6 w-6 ${card.textColor}`} />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}