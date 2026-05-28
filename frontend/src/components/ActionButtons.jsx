import { useState } from "react";
import PaymentModal from "./PaymentModal";
import { getPlayUrl, getDownloadUrl } from "@/services/gameService";
import { usePurchase } from "@/hooks/usePurchase";
import useRequireAuth from "@/hooks/useRequireAuth";
import { toast } from "sonner";

export default function ActionButtons({ game }) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

 const { purchasedIds, addPurchasedId, fetchPurchased, loading: purchaseLoading } =
  usePurchase();

 const rawType = game?.gameType || game?.type || "";
const type = rawType.toLowerCase();

const isBrowser = type === "browser";
const isDownload = type === "download";

const isFree = game?.rawPrice === 0;

  const isPurchased = purchasedIds.includes(String(game?.id));

  const { requireAuth } = useRequireAuth();

  if (purchaseLoading) {
    return <div className="text-white">Đang tải...</div>;
  }

  const handlePlay = async () => {
    try {
      setLoading(true);
      const res = await getPlayUrl(game.id);
      window.open(res.gameUrl, "_blank");
    } catch (err) {
      console.error(err);
      toast.error("Bạn cần đăng nhập để chơi game này!");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      setLoading(true);
      const res = await getDownloadUrl(game.id);

      const link = document.createElement("a");
      link.href = res.downloadUrl;
      link.setAttribute("download", "");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      toast.error("Tải xuống thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 mt-12">

      {/* FREE OR PURCHASED */}
      {(isFree || isPurchased) ? (
        isBrowser ? (
          <button
            onClick={handlePlay}
            disabled={loading}
            className="w-full py-5 rounded-2xl bg-green-600 hover:bg-green-700"
          >
            {loading ? "Đang tải..." : "🎮 Chơi ngay"}
          </button>
        ) : isDownload ? (
          <button
            onClick={handleDownload}
            disabled={loading}
            className="w-full py-5 rounded-2xl bg-blue-600 hover:bg-blue-700"
          >
            {loading ? "Đang tải xuống..." : "⬇ Tải xuống"}
          </button>
        ) : null
      ) : (
        <>
          <button
            onClick={() => {
              if (!requireAuth("Vui lòng đăng nhập để mua game.")) return;
              setShowModal(true);
            }}
            className="w-full py-5 rounded-2xl bg-red-600 hover:bg-red-700"
          >
            Mua ngay
          </button>

          {showModal && (
            <PaymentModal
              game={game}
              onClose={() => setShowModal(false)}
              onSuccess={(id) => {
  addPurchasedId(id);
  fetchPurchased();
}}
            />
          )}
        </>
      )}
    </div>
  );
}
