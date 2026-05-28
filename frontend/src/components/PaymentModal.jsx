import { useState } from "react";
import {
  purchaseGame,
} from "@/services/gameService";

import { toast } from "sonner";
import useRequireAuth from "@/hooks/useRequireAuth";

export default function PaymentModal({ game, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const { requireAuth } = useRequireAuth();

  // const savePurchased = (gameId) => {
  //   const data = localStorage.getItem("purchasedGames");
  //   const list = data ? JSON.parse(data) : [];

  //   if (!list.includes(gameId)) {
  //     list.push(gameId);
  //     localStorage.setItem("purchasedGames", JSON.stringify(list));
  //   }
  // };
const handleConfirm = async () => {
  if (!requireAuth("Vui lòng đăng nhập để mua game.")) return;

  try {
    setLoading(true);

    await purchaseGame(game.id, game.rawPrice);

    toast.success("Thanh toán thành công!");

    onSuccess(game.id);

    onClose();
  } catch (err) {
    console.error(err);
    toast.error(err.message || "Thanh toán thất bại!");
  } finally {
    setLoading(false);
  }
};
  
 

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
      <div className="bg-[#1c1d20] p-6 rounded-xl w-[400px]">
        <h2 className="text-xl font-bold mb-4 !text-white">Xác nhận mua game</h2>

        <p>{game.title}</p>
        <p className="text-zinc-400">{game.price}</p>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 bg-zinc-600 py-2 rounded">
            Hủy
          </button>

          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 bg-red-600 py-2 rounded"
          >
            {loading ? "Đang xử lý..." : "Thanh toán"}
          </button>
        </div>
      </div>
    </div>
  );
}
