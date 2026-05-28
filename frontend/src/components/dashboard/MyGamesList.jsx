import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Gamepad2, Star, MessageSquare, Heart, ChevronRight } from 'lucide-react';

const MyGamesList = ({ games = [], onSelectGame }) => {
  const navigate = useNavigate();

  const handleDetail = (game) => {
    navigate(`/dashboard/games/${game.id}`);
  };

  return (
    <div className="bg-zinc-900/60 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white">Game của tôi</h3>
        <p className="text-sm text-zinc-400">Danh sách các game bạn đã xuất bản</p>
      </div>

      <div className="space-y-4">
        {games.length === 0 ? (
          <div className="text-zinc-400 text-center py-8">Bạn chưa xuất bản game nào.</div>
        ) : (
          games.map(game => (
            <div key={game.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5 hover:border-white/10 transition-colors gap-4">
              <div className="flex items-center gap-4 flex-1">
                {game.thumbnailUrl ? (
                  <img src={game.thumbnailUrl} alt={game.title} className="w-16 h-16 object-cover rounded-lg" />
                ) : (
                  <div className="w-16 h-16 bg-zinc-800 rounded-lg flex items-center justify-center">
                    <Gamepad2 className="w-8 h-8 text-zinc-600" />
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="text-white font-semibold text-lg">{game.title}</h4>
                  <div className="flex items-center flex-wrap gap-4 mt-2 text-sm text-zinc-400">
                    <span className="font-medium text-emerald-400">{game.price > 0 ? `$${game.price}` : 'Miễn phí'}</span>
                    <span className="flex items-center gap-1"><Star className="w-4 h-4 text-amber-400" /> {game.stats?.avgRating || 0}</span>
                    <span className="flex items-center gap-1"><Heart className="w-4 h-4 text-rose-400" /> {game.stats?.ratings || 0}</span>
                    <span className="flex items-center gap-1"><MessageSquare className="w-4 h-4 text-blue-400" /> {game.stats?.comments || 0}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleDetail(game)}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-violet-600 text-white rounded-lg transition-colors text-sm font-medium whitespace-nowrap"
              >
                Chi tiết
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyGamesList;

