import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { fetchNewsById } from '../api/news';
import { NewsItem } from '../types/news';
import { getImageUrl } from '../api/news';
import { Calendar, User, ArrowRight, Loader2, Facebook, MessageCircle, Share2, ImageIcon, ChevronLeft, ChevronRight, Volume2, X } from 'lucide-react';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpeech } from '../hooks/useSpeech';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';
import logo from '../assets/logo.png';

export const NewsDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [news, setNews] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { speak, stop, isReading } = useSpeech();
  const { language } = useLanguage();
  const { t } = useTranslation();

  useEffect(() => {
    const loadNewsItem = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const item = await fetchNewsById(parseInt(id));
        setNews(item || null);
      } catch (error) {
        console.error("Failed to fetch news details", error);
      } finally {
        setLoading(false);
      }
    };

    loadNewsItem();
  }, [id]);

  const handleFacebookShare = () => {
    const url = window.location.href;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };

  const handleWhatsAppShare = () => {
    const url = window.location.href;
    const text = news?.title || '';
    window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
  };

  const handleReadArticle = (e: React.MouseEvent) => {
    e.preventDefault();
    if (news) {
      const cleanContent = news.content
        .replace(/لمزيد من التفاصيل/g, '')
        .replace(/اقرأ المزيد/g, '')
        .replace(/<[^>]*>/g, '');
      const text = `${news.title}. ${cleanContent}`;
      const lang = language === 'ar' ? 'ar-SA' : 'en-US';
      speak(text, lang);
    }
  };

  const nextImage = () => {
    if (!news?.news_images) return;
    setCurrentIndex((prev) => (prev === news.news_images!.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    if (!news?.news_images) return;
    setCurrentIndex((prev) => (prev === 0 ? news.news_images!.length - 1 : prev - 1));
  };

  // Construct meta data
  const pageTitle = news ? `${news.title} - ${t('site_title')}` : t('read_more');
  const pageDescription = news ? news.content.substring(0, 150) + '...' : t('site_description');
  const pageUrl = window.location.href;

  // Get site URL from environment or current location
  const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin;

  // Image logic: News Image -> Logo -> Fallback
  const newsImageUrl = news?.image ? getImageUrl(news.image) : undefined;
  const logoUrl = `${siteUrl}/logo.png`;
  const ogImage = newsImageUrl || logoUrl;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!news) {
    return (
      <div className="container mx-auto px-4 py-16 text-center" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('news_not_found')}</h2>
        <Link to="/" className="text-blue-600 hover:underline">{t('back_to_home')}</Link>
      </div>
    );
  }

  // Filter out unwanted text from content
  const cleanContent = news.content
    .replace(/لمزيد من التفاصيل/g, '')
    .replace(/اقرأ المزيد/g, '');

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:url" content={pageUrl} />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={ogImage} />
      </Helmet>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        {/* Image Gallery */}
        {news.news_images && news.news_images.length > 0 ? (
          <div className="relative h-[300px] md:h-[500px] bg-gray-100 group">
            <AnimatePresence mode='wait'>
              <motion.img
                key={currentIndex}
                src={getImageUrl(news.news_images[currentIndex].path)}
                alt={news.title}
                className="w-full h-full object-contain"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            </AnimatePresence>

            {news.news_images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  {currentIndex + 1} / {news.news_images.length}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="h-64 bg-gray-100 flex items-center justify-center text-gray-400">
            <ImageIcon className="w-12 h-12 mb-2" />
            <span>{language === 'ar' ? 'لا توجد صور' : 'No images'}</span>
          </div>
        )}

        <div className="p-6 md:p-8">
          <div className={`flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6 border-b border-gray-100 pb-4 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
              <Calendar className={`w-4 h-4 text-blue-600 ${language === 'ar' ? 'mr-2' : 'ml-2'}`} />
              {format(new Date(news.date), 'dd MMMM yyyy', { locale: language === 'ar' ? ar : enUS })}
            </div>
            <div className={`flex items-center ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
              <User className={`w-4 h-4 text-blue-600 ${language === 'ar' ? 'mr-2' : 'ml-2'}`} />
              {news.author}
            </div>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
              {news.title}
            </h1>
          </div>

          <div
            className="prose prose-lg max-w-none text-gray-700 leading-relaxed mb-8"
            dangerouslySetInnerHTML={{ __html: cleanContent }}
          />

          <div className="flex items-center justify-between pt-6 border-t border-gray-100">
            <Link
              to="/"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              <ArrowRight className={`w-4 h-4 ${language === 'ar' ? 'ml-2' : 'mr-2 rotate-180'}`} />
              {language === 'ar' ? 'العودة للأخبار' : 'Back to News'}
            </Link>

            <div className="flex gap-3">
              <button
                onClick={handleFacebookShare}
                className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                title={language === 'ar' ? 'مشاركة على فيسبوك' : 'Share on Facebook'}
              >
                <Facebook className="w-5 h-5" />
              </button>
              <button
                onClick={handleWhatsAppShare}
                className="p-2 rounded-full bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                title={language === 'ar' ? 'مشاركة على واتساب' : 'Share on WhatsApp'}
              >
                <MessageCircle className="w-5 h-5" />
              </button>
              {!isReading ? (
                <button
                  onClick={handleReadArticle}
                  className="p-2 rounded-full bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
                  title={language === 'ar' ? 'اقرأ المقال' : 'Read article'}
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={(e) => { e.preventDefault(); stop(); }}
                  className="p-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                  title={language === 'ar' ? 'إيقاف القراءة' : 'Stop reading'}
                >
                  <X className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: news.title,
                      text: news.content.substring(0, 100),
                      url: window.location.href,
                    });
                  }
                }}
                className="p-2 rounded-full bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
                title={language === 'ar' ? 'مشاركة' : 'Share'}
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};