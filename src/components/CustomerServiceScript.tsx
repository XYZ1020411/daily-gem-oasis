
import React, { useEffect } from 'react';

const CustomerServiceScript: React.FC = () => {
  useEffect(() => {
    // 動態載入客服聊天腳本
    const script = document.createElement('script');
    script.src = 'https://plugin-code.salesmartly.com/js/project_316560_325192_1745729147.js';
    script.async = true;
    script.defer = true;
    
    // 載入完成後的回調
    script.onload = () => {
      console.log('客服聊天工具已載入');
    };
    
    script.onerror = () => {
      console.error('客服聊天工具載入失敗');
    };
    
    document.head.appendChild(script);
    
    // 清理函數
    return () => {
      // 移除腳本
      const existingScript = document.querySelector('script[src="https://plugin-code.salesmartly.com/js/project_316560_325192_1745729147.js"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  return null; // 這個組件不渲染任何視覺元素
};

export default CustomerServiceScript;
