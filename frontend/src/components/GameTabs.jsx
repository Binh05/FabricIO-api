import { useState } from 'react';
import DescriptionTab from './DescriptionTab';
import CommentsTab from './CommentsTab';
import RatingsTab from './RatingsTab';

export default function GameTabs({ game }) {
  const [activeTab, setActiveTab] = useState('description');

  const tabs = [
    { id: 'description', label: 'Mô tả' },
    { id: 'comments', label: 'Bình luận' },
    // { id: 'ratings', label: 'Ratings' },
  ];

  return (
    <div className="mt-16 max-w-7xl mx-auto px-6">
      {/* Tab Navigation */}
      <div className="flex border-b border-zinc-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-8 py-4 text-lg font-medium transition-all relative
              ${activeTab === tab.id 
                ? 'text-white' 
                : 'text-zinc-400 hover:text-zinc-200'
              }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-8">
        {activeTab === 'description' && <DescriptionTab game={game} />}
        {activeTab === 'comments' && <CommentsTab  game = {game}/>}
        {/* {activeTab === 'ratings' && <RatingsTab game={game} />} */}
      </div>
    </div>
  );
}
