
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/contexts/UserContext';

export interface SyncData {
  id: string;
  user_id: string;
  data_type: string;
  data_content: any;
  last_modified: string;
  sync_version: number;
}

export const useSync = () => {
  const { user } = useUser();
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      updateOnlineStatus(true);
      return () => {
        updateOnlineStatus(false);
      };
    }
  }, [user]);

  const updateOnlineStatus = async (isOnline: boolean) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_sync_status')
        .upsert({
          user_id: user.id,
          is_online: isOnline,
          last_sync_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating online status:', error);
    }
  };

  const syncData = async (dataType: string, data: any) => {
    if (!user) return null;

    try {
      setSyncStatus('syncing');
      
      const { data: syncData, error } = await supabase
        .from('user_sync_data')
        .upsert({
          user_id: user.id,
          data_type: dataType,
          data_content: data
        })
        .select()
        .single();

      if (error) throw error;

      setSyncStatus('success');
      setLastSyncTime(new Date().toISOString());
      return syncData;
    } catch (error) {
      console.error('Error syncing data:', error);
      setSyncStatus('error');
      return null;
    }
  };

  const getData = async (dataType: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('user_sync_data')
        .select('*')
        .eq('user_id', user.id)
        .eq('data_type', dataType)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error getting sync data:', error);
      return null;
    }
  };

  const getAllUserData = async () => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('user_sync_data')
        .select('*')
        .eq('user_id', user.id)
        .order('last_modified', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting all user data:', error);
      return [];
    }
  };

  return {
    syncStatus,
    lastSyncTime,
    syncData,
    getData,
    getAllUserData,
    updateOnlineStatus
  };
};
