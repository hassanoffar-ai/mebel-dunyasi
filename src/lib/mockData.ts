export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  old_price?: number;
  rating: number;
  reviews_count: number;
  image_url: string;
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
];

export const CATEGORIES = [
  { id: '1', title: 'Qonaq Otağı', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80' },
  { id: '2', title: 'Yataq Otağı', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80' },
  { id: '3', title: 'Mətbəx & Yemək', image: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=800&q=80' },
  { id: '4', title: 'İş və Ofis', image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80' },
];

export const REVIEWS = [
  {
    id: '1',
    name: 'Anar Qasımov',
    rating: 5,
    comment: 'Mebel Dünyasından aldığımız divan dəsti evimizin interyerini tamamilə dəyişdi. Keyfiyyət və dizayn mükəmməldir!',
  },
  {
    id: '2',
    name: 'Nərgiz Məmmədova',
    rating: 5,
    comment: 'Çatdırılma çox sürətli oldu və quraşdırma komandası peşəkar iş gördü. Şübhəsiz ki, yenidən sifariş edəcəyəm.',
  },
  {
    id: '3',
    name: 'Elvin Əliyev',
    rating: 4.5,
    comment: 'Yemək masasının təbii ağac materialı və minimalist stili çox zərif görünür. Təşəkkürlər!',
  },
];
