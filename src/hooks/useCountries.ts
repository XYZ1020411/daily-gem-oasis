
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Country {
  id: string;
  name: string;
  flag_emoji: string;
  difficulty: string;
  power_level: number;
  region: string;
  capital?: string;
  population?: number;
  gdp?: number;
}

export const useCountries = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('countries')
          .select('*')
          .order('power_level', { ascending: false });

        if (error) throw error;
        setCountries(data || []);
      } catch (err) {
        console.error('Error fetching countries:', err);
        setError(err instanceof Error ? err.message : '載入國家資料失敗');
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  return { countries, loading, error };
};
