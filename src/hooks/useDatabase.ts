
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  sync_version: number;
  last_modified: string;
}

export interface Exchange {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  total_price: number;
  status: 'pending' | 'approved' | 'completed' | 'rejected';
  request_date: string;
  processed_date?: string;
  processed_by?: string;
  sync_version: number;
  last_modified: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'urgent';
  created_at: string;
  created_by: string;
  is_active: boolean;
  sync_version: number;
  last_modified: string;
}

export interface GiftCode {
  id: string;
  code: string;
  points: number;
  is_active: boolean;
  used_by: string[];
  created_at: string;
  expires_at: string;
  created_by?: string;
  sync_version: number;
  last_modified: string;
}

export const useDatabase = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [giftCodes, setGiftCodes] = useState<GiftCode[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // 簡化的載入公告（最重要的資料）
  const loadAnnouncements = async () => {
    try {
      const { data } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(5);

      if (data) {
        const typedAnnouncements = data.map(announcement => ({
          ...announcement,
          type: announcement.type as 'info' | 'warning' | 'success' | 'urgent'
        })) as Announcement[];
        setAnnouncements(typedAnnouncements);
      }
    } catch (error) {
      console.error('Error loading announcements:', error);
    }
  };

  // 按需載入其他資料
  const loadProducts = async () => {
    if (products.length > 0) return; // 避免重複載入
    setLoading(true);
    try {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (data) setProducts(data as Product[]);
    } catch (error) {
      toast({
        title: "載入商品失敗",
        description: "無法載入商品資料",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadExchanges = async () => {
    if (exchanges.length > 0) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from('exchanges')
        .select('*')
        .order('request_date', { ascending: false })
        .limit(20);

      if (data) {
        const typedExchanges = data.map(exchange => ({
          ...exchange,
          status: exchange.status as 'pending' | 'approved' | 'completed' | 'rejected'
        })) as Exchange[];
        setExchanges(typedExchanges);
      }
    } catch (error) {
      toast({
        title: "載入兌換記錄失敗",
        description: "無法載入兌換資料",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadGiftCodes = async () => {
    if (giftCodes.length > 0) return;
    try {
      const { data } = await supabase
        .from('gift_codes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (data) setGiftCodes(data as GiftCode[]);
    } catch (error) {
      console.error('Error loading gift codes:', error);
    }
  };

  // 初始載入只載入公告
  useEffect(() => {
    loadAnnouncements();
  }, []);

  // 商品操作
  const addProduct = async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'sync_version' | 'last_modified'>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: "商品新增成功",
        description: `商品 ${productData.name} 已新增`
      });

      return data as Product;
    } catch (error: any) {
      console.error('Error adding product:', error);
      toast({
        title: "新增失敗",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "商品更新成功",
        description: "商品資訊已更新"
      });

      return data as Product;
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast({
        title: "更新失敗",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "商品刪除成功",
        description: "商品已從系統中移除"
      });
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast({
        title: "刪除失敗",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  // 兌換操作
  const addExchange = async (exchangeData: Omit<Exchange, 'id' | 'request_date' | 'sync_version' | 'last_modified'>) => {
    try {
      const { data, error } = await supabase
        .from('exchanges')
        .insert([exchangeData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "兌換申請成功",
        description: "兌換申請已提交，請等待審核"
      });

      return data;
    } catch (error: any) {
      console.error('Error adding exchange:', error);
      toast({
        title: "兌換失敗",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateExchange = async (id: string, updates: Partial<Exchange>) => {
    try {
      const { data, error } = await supabase
        .from('exchanges')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "兌換狀態更新",
        description: "兌換狀態已更新"
      });

      return data;
    } catch (error: any) {
      console.error('Error updating exchange:', error);
      toast({
        title: "更新失敗",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  // 公告操作
  const addAnnouncement = async (announcementData: Omit<Announcement, 'id' | 'created_at' | 'sync_version' | 'last_modified'>) => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .insert([announcementData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "公告發布成功",
        description: `公告 ${announcementData.title} 已發布`
      });

      return data;
    } catch (error: any) {
      console.error('Error adding announcement:', error);
      toast({
        title: "發布失敗",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateAnnouncement = async (id: string, updates: Partial<Announcement>) => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "公告更新成功",
        description: "公告已更新"
      });

      return data;
    } catch (error: any) {
      console.error('Error updating announcement:', error);
      toast({
        title: "更新失敗",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteAnnouncement = async (id: string) => {
    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "公告刪除成功",
        description: "公告已刪除"
      });
    } catch (error: any) {
      console.error('Error deleting announcement:', error);
      toast({
        title: "刪除失敗",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  // 禮品碼操作
  const addGiftCode = async (giftCodeData: Omit<GiftCode, 'id' | 'created_at' | 'sync_version' | 'last_modified'>) => {
    try {
      const { data, error } = await supabase
        .from('gift_codes')
        .insert([giftCodeData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "禮品碼創建成功",
        description: `禮品碼 ${giftCodeData.code} 已創建`
      });

      return data;
    } catch (error: any) {
      console.error('Error adding gift code:', error);
      toast({
        title: "創建失敗",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateGiftCode = async (id: string, updates: Partial<GiftCode>) => {
    try {
      const { data, error } = await supabase
        .from('gift_codes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "禮品碼更新成功",
        description: "禮品碼已更新"
      });

      return data;
    } catch (error: any) {
      console.error('Error updating gift code:', error);
      toast({
        title: "更新失敗",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteGiftCode = async (id: string) => {
    try {
      const { error } = await supabase
        .from('gift_codes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "禮品碼刪除成功",
        description: "禮品碼已刪除"
      });
    } catch (error: any) {
      console.error('Error deleting gift code:', error);
      toast({
        title: "刪除失敗",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  return {
    products,
    exchanges,
    announcements,
    giftCodes,
    loading,
    addProduct,
    updateProduct,
    deleteProduct: async (id: string) => {
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', id);

        if (error) throw error;

        toast({
          title: "商品刪除成功",
          description: "商品已從系統中移除"
        });
      } catch (error: any) {
        console.error('Error deleting product:', error);
        toast({
          title: "刪除失敗",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }
    },
    addExchange: async (exchangeData: Omit<Exchange, 'id' | 'request_date' | 'sync_version' | 'last_modified'>) => {
      try {
        const { data, error } = await supabase
          .from('exchanges')
          .insert([exchangeData])
          .select()
          .single();

        if (error) throw error;

        toast({
          title: "兌換申請成功",
          description: "兌換申請已提交，請等待審核"
        });

        return {
          ...data,
          status: data.status as 'pending' | 'approved' | 'completed' | 'rejected'
        } as Exchange;
      } catch (error: any) {
        console.error('Error adding exchange:', error);
        toast({
          title: "兌換失敗",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }
    },
    updateExchange: async (id: string, updates: Partial<Exchange>) => {
      try {
        const { data, error } = await supabase
          .from('exchanges')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;

        toast({
          title: "兌換狀態更新",
          description: "兌換狀態已更新"
        });

        return {
          ...data,
          status: data.status as 'pending' | 'approved' | 'completed' | 'rejected'
        } as Exchange;
      } catch (error: any) {
        console.error('Error updating exchange:', error);
        toast({
          title: "更新失敗",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }
    },
    addAnnouncement: async (announcementData: Omit<Announcement, 'id' | 'created_at' | 'sync_version' | 'last_modified'>) => {
      try {
        const { data, error } = await supabase
          .from('announcements')
          .insert([announcementData])
          .select()
          .single();

        if (error) throw error;

        toast({
          title: "公告發布成功",
          description: `公告 ${announcementData.title} 已發布`
        });

        return {
          ...data,
          type: data.type as 'info' | 'warning' | 'success' | 'urgent'
        } as Announcement;
      } catch (error: any) {
        console.error('Error adding announcement:', error);
        toast({
          title: "發布失敗",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }
    },
    updateAnnouncement: async (id: string, updates: Partial<Announcement>) => {
      try {
        const { data, error } = await supabase
          .from('announcements')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;

        toast({
          title: "公告更新成功",
          description: "公告已更新"
        });

        return {
          ...data,
          type: data.type as 'info' | 'warning' | 'success' | 'urgent'
        } as Announcement;
      } catch (error: any) {
        console.error('Error updating announcement:', error);
        toast({
          title: "更新失敗",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }
    },
    deleteAnnouncement: async (id: string) => {
      try {
        const { error } = await supabase
          .from('announcements')
          .delete()
          .eq('id', id);

        if (error) throw error;

        toast({
          title: "公告刪除成功",
          description: "公告已刪除"
        });
      } catch (error: any) {
        console.error('Error deleting announcement:', error);
        toast({
          title: "刪除失敗",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }
    },
    addGiftCode: async (giftCodeData: Omit<GiftCode, 'id' | 'created_at' | 'sync_version' | 'last_modified'>) => {
      try {
        const { data, error } = await supabase
          .from('gift_codes')
          .insert([giftCodeData])
          .select()
          .single();

        if (error) throw error;

        toast({
          title: "禮品碼創建成功",
          description: `禮品碼 ${giftCodeData.code} 已創建`
        });

        return data as GiftCode;
      } catch (error: any) {
        console.error('Error adding gift code:', error);
        toast({
          title: "創建失敗",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }
    },
    updateGiftCode: async (id: string, updates: Partial<GiftCode>) => {
      try {
        const { data, error } = await supabase
          .from('gift_codes')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;

        toast({
          title: "禮品碼更新成功",
          description: "禮品碼已更新"
        });

        return data as GiftCode;
      } catch (error: any) {
        console.error('Error updating gift code:', error);
        toast({
          title: "更新失敗",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }
    },
    deleteGiftCode: async (id: string) => {
      try {
        const { error } = await supabase
          .from('gift_codes')
          .delete()
          .eq('id', id);

        if (error) throw error;

        toast({
          title: "禮品碼刪除成功",
          description: "禮品碼已刪除"
        });
      } catch (error: any) {
        console.error('Error deleting gift code:', error);
        toast({
          title: "刪除失敗",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }
    },
    loadProducts,
    loadExchanges,
    loadGiftCodes,
    loadAnnouncements
  };
};
