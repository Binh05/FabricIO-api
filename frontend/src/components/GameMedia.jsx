export default function GameMedia({ game }) {
  return (
    
    <div className="relative rounded-3xl overflow-hidden border border-zinc-800 bg-black">
      <img
        src={game.image}
        alt={game.title}
        className="w-full h-[520px] object-cover"
      />

      {/* Featured badge */}
      <div className="absolute top-6 right-6 bg-amber-500 text-black font-bold px-5 py-2 rounded-full text-sm tracking-wider">
        NỔI BẬT
      </div>

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
    </div>
  );
}
