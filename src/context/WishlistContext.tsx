'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/lib/mockData';
import { supabase } from '@/lib/supabase';

interface WishlistContextType {
  wishlist: Product[];
  toggleWishlist: (product: Product) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const WISHLIST_STORAGE_KEY = 'mebel_dunyamiz_wishlist';

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Initial load from localStorage & listen to Auth Changes
  useEffect(() => {
    // Load local storage favorites first (guest fallback)
    try {
      const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (stored) {
        setWishlist(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load local wishlist', e);
    }
    setIsLoaded(true);

    // Track user session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // 2. Fetch favorites from Supabase when user logs in
  useEffect(() => {
    async function fetchDbFavorites() {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('favorites')
            .select('products(*)');
          
          if (data && !error) {
            const dbProducts = data.map((item: any) => item.products).filter(Boolean);
            
            // Merge local and db products keeping unique ones
            setWishlist(prev => {
              const merged = [...dbProducts];
              const dbIds = new Set(dbProducts.map(p => p.id));
              prev.forEach(p => {
                if (!dbIds.has(p.id)) {
                  merged.push(p);
                  // Optionally sync the local unsynced favorite to DB
                  supabase.from('favorites').insert({ user_id: user.id, product_id: p.id }).then();
                }
              });
              return merged;
            });
          }
        } catch (e) {
          console.error('Error syncing DB favorites', e);
        }
      }
    }

    if (isLoaded) {
      fetchDbFavorites();
    }
  }, [user, isLoaded]);

  // 3. Save to LocalStorage (as guest backup) whenever state changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
      } catch (e) {
        console.error('Failed to save wishlist', e);
      }
    }
  }, [wishlist, isLoaded]);

  const toggleWishlist = async (product: Product) => {
    const isExist = wishlist.some(p => p.id === product.id);

    if (isExist) {
      // Remove
      setWishlist(prev => prev.filter(p => p.id !== product.id));

      if (user) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', product.id);
      }
    } else {
      // Add
      setWishlist(prev => [...prev, product]);

      if (user) {
        await supabase
          .from('favorites')
          .insert({ user_id: user.id, product_id: product.id });
      }
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some(p => p.id === productId);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
