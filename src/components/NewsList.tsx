import React from 'react';
import { NewsItem } from '../types/news';
import { NewsCard } from './NewsCard';

interface NewsListProps {
  news: NewsItem[];
}

export const NewsList: React.FC<NewsListProps> = ({ news }) => {
  if (news.length === 0) {
    return <div className="text-center py-10 text-gray-500">لا توجد أخبار متاحة حالياً</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {news.map((item) => (
        <NewsCard key={item.id} article={item} isHome={true} />
      ))}
    </div>
  );
};
