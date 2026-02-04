export interface NewsImage {
  id: number;
  news_id: number;
  path: string;
  main_image: number; // 0 or 1
  created_at: string;
  updated_at: string;
}

export interface NewsItem {
  id: number;
  title: string;
  content: string;
  date: string;
  author: string;
  image?: string;
  news_images: NewsImage[];
}
