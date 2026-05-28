import React from 'react';
import { ArrowLeft, Star, Heart, MessageSquare } from 'lucide-react';
import { getUserAvatarUrl } from '@/utils/userProfile';

const GameAnalyticsTab = ({ game, onBack }) => {
  if (!game) return null;

  const comments = game.stats?.commentsData || [];

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-sm text-zinc-400 mb-1">
              <span className="cursor-pointer hover:text-white transition-colors" onClick={onBack}>Bảng điều khiển</span>
              <span>/</span>
              <span className="text-violet-400">{game.title}</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white">Chi tiết & Phản hồi</h2>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Giá', value: game.price > 0 ? `$${game.price}` : 'Miễn phí', color: 'text-emerald-400' },
          { label: 'Lượt đánh giá', value: game.stats?.ratings || 0, color: 'text-rose-400' },
          { label: 'Điểm trung bình', value: `${game.stats?.avgRating || 0}/5`, color: 'text-amber-400' },
          { label: 'Bình luận', value: game.stats?.comments || 0, color: 'text-blue-400' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-zinc-900/60 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors">
            <p className="text-zinc-400 text-sm font-medium mb-1">{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Comments Section */}
      <div className="bg-zinc-900/60 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-400" />
          Bình luận gần đây
        </h3>
        
        {comments.length === 0 ? (
          <p className="text-zinc-400 text-center py-8">Game này chưa có bình luận nào.</p>
        ) : (
          <div className="space-y-6">
            {comments.map((comment, idx) => (
              <div key={idx} className="flex gap-4 p-4 rounded-xl bg-black/40 border border-white/5">
                {comment.commentator?.avatarUrl || comment.commentator?.avatar ? (
                  <img src={getUserAvatarUrl(comment.commentator)} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center font-bold text-white uppercase">
                    {comment.commentator?.displayName?.charAt(0) || '?'}
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h5 className="font-semibold text-white">{comment.commentator?.displayName}</h5>
                    <span className="text-xs text-zinc-500">
                      {new Date(comment.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <p className="text-zinc-300 mt-2 text-sm leading-relaxed">{comment.comment?.content || comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GameAnalyticsTab;
