import React, { useEffect, useState, useCallback } from 'react';
import { fetchNews } from '../api/news';
import { NewsItem } from '../types/news';
import { NewsList } from '../components/NewsList';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';
import { Loader2 } from 'lucide-react';

export const Home: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const { language } = useLanguage();
  const { t } = useTranslation();

  const loadNews = useCallback(async (pageNum: number) => {
    if (loading) return;
    setLoading(true);
    try {
      const newNews = await fetchNews(pageNum);
      if (newNews.length === 0) {
        setHasMore(false);
      } else {
        setNews(prev => {
            // Filter out duplicates just in case, though our mock logic generates unique IDs
            const existingIds = new Set(prev.map(n => n.id));
            const uniqueNewNews = newNews.filter(n => !existingIds.has(n.id));
            return [...prev, ...uniqueNewNews];
        });
      }
    } catch (error) {
      console.error("Failed to fetch news", error);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  useEffect(() => {
    loadNews(1);
  }, []); // Initial load

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      // Use more robust scroll calculation for mobile
      const scrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
      const clientHeight = window.innerHeight || document.documentElement.clientHeight;

      // Trigger when user is within 200px of the bottom (increased threshold for mobile)
      // Using >= instead of === to handle fractional pixels and overscroll
      if (scrollTop + clientHeight >= scrollHeight - 200 && !loading && hasMore) {
        setPage(prev => {
          const nextPage = prev + 1;
          loadNews(nextPage);
          return nextPage;
        });
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, hasMore, loadNews]);

  return (
    <div className="container mx-auto px-4 py-8" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">{t('latest_news')}</h2>
        <div className="flex flex-col">
            <p className="text-lg md:text-xl font-bold leading-tight">
              {t('company_name')}
            
              {language === 'ar' ? <br /> : ' '}
              {t('company_location')}
            </p>
          </div>
      </div>

      <NewsList news={news} />

      {loading && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      )}

      {!hasMore && news.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          {t('end_of_news')}
        </div>
      )}
    </div>
  );
};
