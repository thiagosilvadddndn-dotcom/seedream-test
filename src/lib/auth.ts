import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { supabaseAdmin } from './supabase-admin';

interface ExtendedUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export const authOptions: NextAuthOptions = {
  // 移除adapter，使用JWT策略
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      httpOptions: {
        timeout: 60000, // 增加超时时间到60秒
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // 将用户信息存储到JWT token中
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // 从JWT token获取用户信息
      if (session.user && token) {
        session.user = {
          ...session.user,
          id: token.id as string,
        };
      }
      return session;
    },
    async signIn({ user }) {
      // 默认允许所有Google登录
      if (user) {
        try {
          // 常见临时邮箱黑名单
          const disposableDomains = [
            'tempmail.com', '10minutemail.com', 'guerrillamail.com', 'throwawaymail.com',
            'mailinator.com', 'yopmail.com', 'sharklasers.com', 'getairmail.com'
          ];
          const emailDomain = user.email?.split('@')[1]?.toLowerCase();
          
          // 如果是临时邮箱，直接拒绝登录
          if (emailDomain && disposableDomains.includes(emailDomain)) {
            console.log(`Blocked disposable email: ${user.email}`);
            return false;
          }

          const extendedUser = user as ExtendedUser;
          
          // Check if user exists in our custom users_profile table
          const { data: existingUser, error } = await supabaseAdmin
            .from('users_profile')
            .select('*')
            .eq('email', extendedUser.email)
            .single();

          if (error && error.code === 'PGRST116') {
            // User doesn't exist, create new user with default credits
            const { error: insertError } = await supabaseAdmin
              .from('users_profile')
              .insert({
                email: extendedUser.email!,
                name: extendedUser.name,
                avatar: extendedUser.image,
                credits: 12,
              });

            if (insertError) {
              console.error('Error creating user:', insertError);
              return false;
            }
          } else if (existingUser) {
            // User exists, update their info
            const { error: updateError } = await supabaseAdmin
              .from('users_profile')
              .update({
                name: extendedUser.name,
                avatar: extendedUser.image,
                updated_at: new Date().toISOString(),
              })
              .eq('email', extendedUser.email);

            if (updateError) {
              console.error('Error updating user:', updateError);
            }
          }
        } catch (error) {
          console.error('Error in signIn callback:', error);
          return false;
        }
      }
      return true;
    },
  },
  session: {
    strategy: 'jwt', // 使用JWT策略
    maxAge: 30 * 24 * 60 * 60, // 30天
  },
}; 