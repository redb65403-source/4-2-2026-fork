import { NewsItem, NewsImage } from '../types/news';

// API Configuration from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://backend.ascww.org/api';
const TARGET_URL = `${API_BASE_URL}/news`;
const IMAGE_BASE_URL = `${API_BASE_URL}/news/image/`;

// List of proxies to try in order
// We use multiple proxies to increase the chance of success
const PROXIES = [
  'https://api.codetabs.com/v1/proxy?quest=',
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url=',
  'https://thingproxy.freeboard.io/fetch/',
];

// Mock data for fallback when all proxies fail
const MOCK_NEWS: NewsItem[] = [
  {
    id: 1,
    title: "تنبيه: يتم عرض بيانات تجريبية (تعذر الاتصال بالخادم)",
    content: "<p>نعتذر، يبدو أن خادم API الخاص بك (backend.ascww.org) يقوم بحظر جميع محاولات الاتصال عبر البروكسي العامة (CORS Proxies).</p><p>لحل المشكلة نهائياً وجعل الموقع يعمل على أي متصفح، يجب ضبط إعدادات الخادم للسماح بطلبات CORS (Access-Control-Allow-Origin: *) أو استخدام خادم وسيط خاص (Backend).</p>",
    date: new Date().toISOString(),
    author: "النظام",
    image: undefined,
    news_images: []
  },
  {
    id: 2,
    title: "شركة مياه الشرب والصرف الصحى بأسيوط تعلن عن وظائف جديدة",
    content: "<p>تعلن شركة مياه الشرب والصرف الصحى بأسيوط والوادى الجديد عن حاجتها لشغل وظائف جديدة...</p>",
    date: new Date(Date.now() - 86400000).toISOString(),
    author: "المركز الإعلامي",
    image: undefined,
    news_images: []
  },
  {
    id: 3,
    title: "حملة توعية لترشيد استهلاك المياه",
    content: "<p>انطلقت اليوم حملة توعية مكبرة لترشيد استهلاك المياه في المدارس والمصالح الحكومية...</p>",
    date: new Date(Date.now() - 172800000).toISOString(),
    author: "المركز الإعلامي",
    image: undefined,
    news_images: []
  }
];

export const getImageUrl = (path?: string): string => {
  if (!path) return 'https://images.unsplash.com/photo-1576451819248-b96f5b529758?ixlib=rb-4.1.0&q=80&w=1080'; // Fallback
  if (path.startsWith('http')) return path;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${IMAGE_BASE_URL}${cleanPath}`;
};

interface ApiNewsItem {
  id: number;
  title: string;
  description: string;
  created_at: string;
  news_images: NewsImage[];
}

const fetchWithProxy = async (url: string): Promise<Response> => {
  // Try direct fetch first
  try {
    const response = await fetch(url);
    if (response.ok) return response;
  } catch (e) {
    // Ignore
  }

  // Try proxies
  for (const proxy of PROXIES) {
    try {
      const proxyUrl = `${proxy}${encodeURIComponent(url)}`;
      console.log(`Trying proxy: ${proxy}`);
      const response = await fetch(proxyUrl);
      if (response.ok) return response;
    } catch (e) {
      console.warn(`Proxy ${proxy} failed:`, e);
    }
  }
  throw new Error('All proxies failed');
};

export const fetchNews = async (page: number = 1): Promise<NewsItem[]> => {
  try {
    const response = await fetchWithProxy(TARGET_URL);
    const data: ApiNewsItem[] = await response.json();

    // Map API data to NewsItem
    const newsItems: NewsItem[] = data.map(item => {
      const images = item.news_images || [];
      const mainImage = images.find(img => img.main_image === 1) || images[0];

      return {
        id: item.id,
        title: item.title,
        content: item.description,
        date: item.created_at,
        author: "المركز الإعلامي",
        image: mainImage ? mainImage.path : undefined,
        news_images: images
      };
    });

    newsItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const ITEMS_PER_PAGE = 6;
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;

    return newsItems.slice(start, end);

  } catch (error) {
    console.error("Error fetching news:", error);
    // Return mock data only for first page to show UI
    if (page === 1) return MOCK_NEWS;
    return [];
  }
};

export const fetchNewsById = async (id: number): Promise<NewsItem | undefined> => {
  try {
    const response = await fetchWithProxy(TARGET_URL);
    const data: ApiNewsItem[] = await response.json();

    const item = data.find(n => n.id === id);
    if (!item) return undefined;

    const images = item.news_images || [];
    const mainImage = images.find(img => img.main_image === 1) || images[0];

    return {
      id: item.id,
      title: item.title,
      content: item.description,
      date: item.created_at,
      author: "المركز الإعلامي",
      image: mainImage ? mainImage.path : undefined,
      news_images: images
    };
  } catch (error) {
    console.error("Error fetching news details:", error);
    // Return mock item if ID matches mock
    const mockItem = MOCK_NEWS.find(n => n.id === id);
    if (mockItem) return mockItem;
    return undefined;
  }
};

