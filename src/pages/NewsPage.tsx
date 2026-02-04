import React, { useEffect, useState } from 'react';
import { fetchNews } from '../api/news';
import { NewsItem } from '../types/news';
import { NewsCard } from '../components/NewsCard';
import { Loader2, AlertCircle, Newspaper } from 'lucide-react';

export const NewsPage: React.FC = () => {
  const [articles, setArticles] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const loadNews = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchNews(page);
        setArticles(data);
      } catch (err) {
        setError('فشل تحميل الأخبار. يرجى المحاولة مرة أخرى.');
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, [page]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl" dir="rtl">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-4">
          <Newspaper className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">آخر الأخبار</h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-lg">
          تابع أحدث المستجدات والأخبار من المركز الإعلامي.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center h-64">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-500 font-medium">جاري تحميل الأخبار...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-64 text-red-500 bg-red-50 rounded-2xl p-8 border border-red-100">
          <AlertCircle className="w-12 h-12 mb-4" />
          <p className="text-lg font-medium text-red-800">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-2 bg-white border border-red-200 text-red-700 rounded-lg hover:bg-red-50 transition-colors shadow-sm"
          >
            إعادة المحاولة
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
          
          {articles.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              لا توجد أخبار لعرضها حالياً.
            </div>
          )}
        </>
      )}
    </div>
  );
};
