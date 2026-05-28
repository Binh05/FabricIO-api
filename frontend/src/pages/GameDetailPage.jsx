import React, { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import GameDetailSection from "@/sections/GameDetailSection";
import { useGameDetail } from "../hooks/useGameDetail";


const GameDetailPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
 
  const { game, loading, error } = useGameDetail();


  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Header onOpenSidebar={() => setIsSidebarOpen(true)} />


      <div className="flex">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />


        <main className="flex-1 min-h-screen">
          {loading ? (
            <div className="flex items-center justify-center h-screen">
              <div className="text-2xl text-zinc-400">Đang tải thông tin game...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-screen">
              <div className="text-center">
                <div className="text-2xl text-red-400 mb-4">⚠️ Lỗi</div>
                <div className="text-lg text-zinc-400">{error}</div>
                <div className="text-sm text-zinc-500 mt-4">Vui lòng kiểm tra kết nối với server</div>
              </div>
            </div>
          ) : (
            game && <GameDetailSection game={game} />
          )}
        </main>
      </div>
    </div>
  );
};


export default GameDetailPage;

