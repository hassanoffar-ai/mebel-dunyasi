export interface Product {
  id: string;
  sku?: string;
  name: string;
  category: string;
  price: number;
  old_price?: number;
  rating: number;
  reviews_count: number;
  image_url: string;
  images?: string[];
  material?: string;
  dimensions?: string;
  color?: string;
  description?: string;
  stock?: number;
}

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Minimalist Velvet Divan',
    category: 'Qonaq Otağı',
    price: 1450,
    old_price: 1650,
    rating: 4.8,
    reviews_count: 34,
    image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '2',
    name: 'Təbii Palıd Yemək Masası',
    category: 'Mətbəx',
    price: 980,
    rating: 4.6,
    reviews_count: 19,
    image_url: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '3',
    name: 'Lüks Ketan Çarpayı Dəsti',
    category: 'Yataq Otağı',
    price: 2100,
    old_price: 2350,
    rating: 4.9,
    reviews_count: 52,
    image_url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '4',
    name: 'Qəhvəyi Dəri Aksent Kreslo',
    category: 'Qonaq Otağı',
    price: 750,
    rating: 4.7,
    reviews_count: 28,
    image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '5',
    name: 'Rəngarəng Uşaq Çarpayısı və Dolab Dəsti',
    category: 'Uşaq Otağı',
    price: 890,
    old_price: 1050,
    rating: 4.9,
    reviews_count: 14,
    image_url: 'https://images.unsplash.com/photo-1588854337221-4cf9fa96059c?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '6',
    name: 'Təbii Taxta Yemək Masası və 6 Stul Dəsti',
    category: 'Masa və Stullar',
    price: 1250,
    old_price: 1400,
    rating: 4.8,
    reviews_count: 22,
    image_url: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80',
  },
];

export const CATEGORIES = [
  { id: '1', title: 'Qonaq Otağı', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80' },
  { id: '2', title: 'Yataq Otağı', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80' },
  { id: '3', title: 'Mətbəx & Yemək', image: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=800&q=80' },
  { id: '4', title: 'İş və Ofis', image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80' },
  { id: '5', title: 'Uşaq Otağı', image: 'https://images.unsplash.com/photo-1588854337221-4cf9fa96059c?auto=format&fit=crop&w=800&q=80' },
  { id: '6', title: 'Masa və Stullar', image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80' },
];
