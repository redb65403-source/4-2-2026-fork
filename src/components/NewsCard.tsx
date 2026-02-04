import React from 'react';
import { Link } from 'react-router-dom';
import { NewsItem } from '../types/news';
import { getImageUrl } from '../api/news';
import { Calendar, User, ArrowRight, Facebook, MessageCircle, Volume2, X } from 'lucide-react';
import { useSpeech } from '../hooks/useSpeech';
import { useLanguage } from '../context/LanguageContext';

interface NewsCardProps {
  article: NewsItem;
  isHome?: boolean;
}

export const NewsCard: React.FC<NewsCardProps> = ({ article, isHome }) => {
  const { speak, stop, isReading } = useSpeech();
  const { language } = useLanguage();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Strip HTML tags from content for preview
  const stripHtml = (html: string) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const articleUrl = `${window.location.origin}/news/${article.id}`;

  const handleFacebookShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`, '_blank');
  };

  const handleWhatsAppShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const text = `${article.title} ${articleUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleReadArticle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const text = `${article.title}. ${stripHtml(article.content)}`;
    const lang = language === 'ar' ? 'ar-SA' : 'en-US';
    speak(text, lang);
  };

  const handleStopReading = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    stop();
  };

  return (
    <div className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full border border-gray-100 group`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Link to={`/news/${article.id}`} className="h-48 overflow-hidden relative block">
        <img
          src={getImageUrl(article.image)}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=2070&auto=format&fit=crop';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Link>

      <div className="p-5 flex-1 flex flex-col">
        <div className={`flex items-center text-xs text-gray-500 mb-3 space-x-4 ${language === 'ar' ? 'space-x-reverse flex-row-reverse' : ''}`}>
          <span className={`flex items-center ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
            <Calendar className={`w-3 h-3 ${language === 'ar' ? 'mr-1' : 'ml-1'}`} />
            {formatDate(article.date)}
          </span>
          <span className={`flex items-center truncate max-w-[150px] ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
            <User className={`w-3 h-3 ${language === 'ar' ? 'mr-1' : 'ml-1'}`} />
            {article.author}
          </span>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 leading-tight hover:text-blue-600 transition-colors">
          <Link to={`/news/${article.id}`}>
            {article.title}
          </Link>
        </h3>

        <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">
          {stripHtml(article.content)}
        </p>

        <div className={`mt-auto pt-4 border-t border-gray-100 flex justify-between items-center ${language === 'ar' || isHome ? 'flex-row-reverse' : ''}`}>
          <Link
            to={`/news/${article.id}`}
            className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors group"
          >
            {language === 'ar' ? 'اقرأ المزيد' : 'Read More'}
            <ArrowRight className={`w-4 h-4 group-hover:${language === 'ar' ? '-translate-x-1' : 'translate-x-1'} transition-transform ${language === 'ar' ? 'rotate-180' : ''}`} />
          </Link>
          <div className="flex gap-2">
            <button
              onClick={handleFacebookShare}
              className="p-1.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
              title={language === 'ar' ? 'مشاركة على فيسبوك' : 'Share on Facebook'}
            >
              <Facebook className="w-4 h-4" />
            </button>
            <button
              onClick={handleWhatsAppShare}
              className="p-1.5 rounded-full bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
              title={language === 'ar' ? 'مشاركة على واتساب' : 'Share on WhatsApp'}
            >
              <MessageCircle className="w-4 h-4" />
            </button>
            {!isReading ? (
              <button
                onClick={handleReadArticle}
                className="p-1.5 rounded-full bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
                title={language === 'ar' ? 'اقرأ المقال' : 'Read article'}
              >
                <Volume2 className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleStopReading}
                className="p-1.5 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                title={language === 'ar' ? 'إيقاف القراءة' : 'Stop reading'}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};