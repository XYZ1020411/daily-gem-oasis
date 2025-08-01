import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  Gift, 
  Users, 
  ShoppingBag, 
  Wallet, 
  Settings,
  LogOut
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { useUser } from '@/contexts/UserContext';
import AnnouncementBoard from './AnnouncementBoard';
import GiftCodeBoard from './GiftCodeBoard';

interface AppSidebarProps {
  onPageChange: (page: string) => void;
  currentPage: string;
}

export function AppSidebar({ onPageChange, currentPage }: AppSidebarProps) {
  const { state } = useSidebar();
  const { signOut, profile } = useUser();
  const collapsed = state === 'collapsed';
  
  const navigationItems = [
    { title: '首頁', key: 'home', icon: Home },
    { title: '積分商城', key: 'shop', icon: ShoppingBag },
    { title: '我的錢包', key: 'wallet', icon: Wallet },
    ...(profile?.role === 'admin' ? [{ title: '管理後台', key: 'admin', icon: Settings }] : []),
  ];

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('登出失敗:', error);
    }
  };

  const isActive = (key: string) => currentPage === key;

  return (
    <Sidebar
      className={collapsed ? "w-14" : "w-80"}
      collapsible="icon"
    >
      <SidebarTrigger className="m-2 self-end" />
      
      <SidebarContent className="space-y-4">
        {/* 導航菜單 */}
        <SidebarGroup>
          <SidebarGroupLabel>導航</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton 
                    asChild
                    className={isActive(item.key) ? "bg-primary text-primary-foreground" : ""}
                  >
                    <button
                      onClick={() => onPageChange(item.key)}
                      className="w-full flex items-center gap-2 p-2 rounded hover:bg-muted transition-colors"
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 p-2 rounded hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    {!collapsed && <span>登出</span>}
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* 公告區 - 只在展開狀態顯示 */}
        {!collapsed && (
          <>
            <SidebarGroup>
              <SidebarGroupLabel>系統公告</SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="px-2">
                  <AnnouncementBoard />
                </div>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>兌換碼公告</SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="px-2">
                  <GiftCodeBoard />
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>
    </Sidebar>
  );
}

export default AppSidebar;