import React from 'react';
import { Gamepad2, Heart, MessageSquare, Star, FileText } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="bg-zinc-900/60 backdrop-blur-sm border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-zinc-400 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-white">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl border ${colorClass}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  </div>
);

const StatsCards = ({ stats }) => {
  const statList = [
    { title: 'Game đã đăng', value: stats?.totalGames || '0', icon: Gamepad2, colorClass: 'bg-violet-500/20 text-violet-400 border-violet-500/20' },
    { title: 'Bài viết đã đăng', value: stats?.totalPosts ?? '0', icon: FileText, colorClass: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/20' },
    { title: 'Lượt đánh giá', value: stats?.totalRatings || '0', icon: Heart, colorClass: 'bg-rose-500/20 text-rose-400 border-rose-500/20' },
    { title: 'Điểm trung bình', value: `${stats?.avgRating || '0'} / 5.0`, icon: Star, colorClass: 'bg-amber-500/20 text-amber-400 border-amber-500/20' },
    { title: 'Bình luận', value: stats?.totalComments || '0', icon: MessageSquare, colorClass: 'bg-blue-500/20 text-blue-400 border-blue-500/20' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {statList.map((stat, idx) => (
        <StatCard key={idx} {...stat} />
      ))}
    </div>
  );
};

export default StatsCards;
