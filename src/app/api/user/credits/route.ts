import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  try {
    // 验证用户会话
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 从数据库获取用户积分
    const { data, error } = await supabaseAdmin
      .from('users_profile')
      .select('credits')
      .eq('email', session.user.email)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user credits:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    const credits = data?.credits || 0;
    
    return NextResponse.json({ credits });
  } catch (error) {
    console.error('Error in credits API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 