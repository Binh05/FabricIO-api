export default function VideoPlaceholder() {
  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-3xl h-96 flex flex-col items-center justify-center text-center p-8">
      <div className="w-20 h-20 rounded-full border-4 border-zinc-700 flex items-center justify-center mb-6">
        <span className="text-4xl">📹</span>
      </div>
      <p className="text-zinc-400 text-xl">Video không có sẵn</p>
      <a
        href="https://youtube.com"
        target="_blank"
        className="mt-4 text-blue-400 hover:text-blue-500 underline"
      >
        Xem trailer trên YouTube
      </a>
    </div>
  );
}