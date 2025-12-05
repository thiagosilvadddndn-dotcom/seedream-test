import { NextRequest, NextResponse } from 'next/server'; 
import { getServerSession } from 'next-auth'; 
import { authOptions } from '@/lib/auth'; 
import { supabaseAdmin } from '@/lib/supabase-admin'; 
// import { uploadImageToR2 } from '@/lib/upload-to-r2'; // 暂时不需要 R2 
import { getModelConfig, getDefaultModel } from '@/config/models.config';
import Replicate from "replicate"; 

export async function POST(request: NextRequest) { 
  try { 
    // 1. 验证用户 
    const session = await getServerSession(authOptions); 
    if (!session?.user?.email) { 
      return NextResponse.json({ 
        error: 'UNAUTHORIZED', 
        message: 'Please sign in to generate images' 
      }, { status: 401 }); 
    } 

    // 2. 解析参数 
    const { prompt, aspectRatio, model } = await request.json(); 
    
    if (!prompt) { 
      return NextResponse.json({ error: 'MISSING_PARAMS', message: 'Prompt is required' }, { status: 400 }); 
    } 

    // 3. 初始化 Replicate 客户端
    const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

    // 4. 模型验证和积分计算
    const selectedModel = model || 'nano-banana-fast'; // 默认使用Fast模型
    let requiredCredits: number;
    
    if (selectedModel === 'nano-banana-pro' || selectedModel === 'seedream-pro') {
      requiredCredits = 30; // Pro模型30积分
    } else {
      requiredCredits = 12; // Fast模型12积分（默认）
    }

    // 5. 获取用户积分 
    const { data: userData, error: userError } = await supabaseAdmin 
      .from('users_profile') 
      .select('id, credits') 
      .eq('email', session.user.email) 
      .single(); 

    if (userError || !userData) { 
      console.error('Database error:', userError); 
      return NextResponse.json({ error: 'DATABASE_ERROR', message: 'Failed to fetch user data' }, { status: 500 }); 
    } 

    const currentCredits = userData.credits || 0; 

    // 6. 检查积分 
    if (currentCredits < requiredCredits) { 
      return NextResponse.json({ 
        error: 'INSUFFICIENT_CREDITS', 
        message: `Not enough credits. You have ${currentCredits}, need ${requiredCredits}.` 
      }, { status: 402 }); 
    } 

    // 7. 调用 Seedream 4.5 模型
    // 分辨率策略：Pro模型使用4K，其他使用2K
    const isPro = selectedModel === 'nano-banana-pro' || selectedModel === 'seedream-pro';
    
    console.log('[Replicate] Submitting task...', { 
      model: 'bytedance/seedream-4.5', 
      credits: requiredCredits, 
      isPro, 
      size: isPro ? "4K" : "2K"
    }); 
    
    // 调用 Replicate API
    const output = await replicate.run("bytedance/seedream-4.5", { 
      input: { 
        prompt: prompt, 
        aspect_ratio: aspectRatio || "1:1", 
        size: isPro ? "4K" : "2K", 
        disable_safety_checker: false 
      } 
    }) as string[]; 
    
    // 8. 获取生成的图片URL
    const generatedImageUrl = output[0];
    if (!generatedImageUrl) throw new Error('No image URL returned from Replicate');

    console.log('[Replicate] Success! Generated image URL:', generatedImageUrl);
    const finalImageUrl = generatedImageUrl; 

    // 9. 扣费并记录历史 
    await Promise.all([ 
      // 扣分 
      supabaseAdmin 
        .from('users_profile') 
        .update({ 
          credits: currentCredits - requiredCredits, 
          updated_at: new Date().toISOString() 
        }) 
        .eq('id', userData.id), 
      
      // 存历史 (用临时链接) 
      supabaseAdmin 
        .from('generation_history') 
        .insert({ 
          user_id: userData.id, 
          url: finalImageUrl, 
          prompt: prompt, 
          aspect_ratio: aspectRatio, 
          model: selectedModel, // 记录使用的模型
          credits_used: requiredCredits 
        }) 
    ]); 

    return NextResponse.json({ 
      success: true, 
      imageUrl: finalImageUrl, 
      remainingCredits: currentCredits - requiredCredits,
      modelUsed: selectedModel 
    }); 

  } catch (error: any) { 
    console.error('Route Error:', error); 
    return NextResponse.json({ 
      error: 'SERVER_ERROR', 
      message: error.message || 'Internal Server Error' 
    }, { status: 500 }); 
  } 
}