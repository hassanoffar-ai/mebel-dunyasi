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

export const MOCK_PRODUCTS: Product[] = [];

export const CATEGORIES = [
  { id: '1', title: 'Qonaq Otağı', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80' },
  { id: '2', title: 'Yataq Otağı', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80' },
  { id: '3', title: 'Mətbəx & Yemək', image: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=800&q=80' },
  { id: '4', title: 'İş və Ofis', image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80' },
  { id: '5', title: 'Uşaq Otağı', image: 'https://images.unsplash.com/photo-1588854337221-4cf9fa96059c?auto=format&fit=crop&w=800&q=80' },
  { id: '6', title: 'Masa və Stullar', image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80' },
];
