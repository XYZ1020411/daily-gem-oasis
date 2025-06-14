
import { supabase } from '@/integrations/supabase/client';

interface EmailData {
  to: string;
  subject: string;
  html: string;
  from?: string;
  attachments?: Array<{
    filename: string;
    content: string;
    type: string;
  }>;
}

export const useEmailService = () => {
  const sendEmail = async (emailData: EmailData) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: emailData
      });

      if (error) {
        throw error;
      }

      return { success: true, data };
    } catch (error: any) {
      console.error('Error sending email:', error);
      throw new Error(error.message || '發送電子郵件時發生錯誤');
    }
  };

  const sendWelcomeEmail = async (email: string, displayName: string) => {
    const welcomeHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; text-align: center;">歡迎加入積分會員系統！</h1>
        <p>親愛的 ${displayName}，</p>
        <p>感謝您註冊我們的積分會員系統！您現在可以開始享受以下功能：</p>
        <ul>
          <li>每日簽到獲得積分</li>
          <li>兌換精美禮品</li>
          <li>參與各種遊戲活動</li>
          <li>享受VIP會員專屬優惠</li>
        </ul>
        <p>立即登入開始您的積分之旅吧！</p>
        <p style="text-align: center;">
          <a href="${window.location.origin}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">立即登入</a>
        </p>
        <p style="color: #666; font-size: 12px; text-align: center; margin-top: 20px;">
          © 2024 積分會員系統. 版權所有.
        </p>
      </div>
    `;

    return sendEmail({
      to: email,
      subject: '歡迎加入積分會員系統！',
      html: welcomeHtml
    });
  };

  const sendPasswordResetEmail = async (email: string, resetLink: string) => {
    const resetHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; text-align: center;">重設密碼</h1>
        <p>您好，</p>
        <p>我們收到了您重設密碼的請求。請點擊下面的連結來重設您的密碼：</p>
        <p style="text-align: center;">
          <a href="${resetLink}" style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">重設密碼</a>
        </p>
        <p>如果您沒有請求重設密碼，請忽略此郵件。</p>
        <p>此連結將在24小時後失效。</p>
        <p style="color: #666; font-size: 12px; text-align: center; margin-top: 20px;">
          © 2024 積分會員系統. 版權所有.
        </p>
      </div>
    `;

    return sendEmail({
      to: email,
      subject: '重設密碼 - 積分會員系統',
      html: resetHtml
    });
  };

  const sendEmailWithAttachment = async (
    to: string, 
    subject: string, 
    content: string, 
    attachments?: Array<{filename: string, content: string, type: string}>
  ) => {
    return sendEmail({
      to,
      subject,
      html: content,
      attachments
    });
  };

  const deleteEmailAttachment = async (attachmentId: string) => {
    try {
      // 這裡可以添加刪除附件的邏輯
      console.log('Deleting attachment:', attachmentId);
      return { success: true };
    } catch (error) {
      console.error('Error deleting attachment:', error);
      throw new Error('刪除附件時發生錯誤');
    }
  };

  return {
    sendEmail,
    sendWelcomeEmail,
    sendPasswordResetEmail,
    sendEmailWithAttachment,
    deleteEmailAttachment
  };
};
