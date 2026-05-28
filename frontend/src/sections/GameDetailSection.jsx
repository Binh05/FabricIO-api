import GameMedia from '@/components/GameMedia';
import GameInfo from '@/components/GameInfo';
import ActionButtons from '@/components/ActionButtons';
import VideoPlaceholder from '@/components/VideoPlaceholder';
import GameTabs from '@/components/GameTabs';

export default function GameDetailSection({ game }) {
  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-8">
          <GameMedia game={game} />
          {/* <VideoPlaceholder /> */}
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4">
          <div className="sticky top-8">
            <GameInfo game={game} />
            <ActionButtons game={game} />
          </div>
        </div>
      </div>

      {/* Tabs Section - Description, Comments, Ratings */}
      <GameTabs game={game} />
    </div>
  );
}