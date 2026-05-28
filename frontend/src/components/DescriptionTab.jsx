export default function DescriptionTab({ game }) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 md:p-10">
      <h2 className="text-3xl font-bold mb-6 !text-white">Tổng quan game</h2>
      <p className="text-zinc-300 leading-relaxed text-lg">
        {game.description}
      </p>

      
    </div>
  );
}
