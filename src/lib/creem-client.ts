// Creem 客户端文件（前端使用）
// 根据 Creem 文档，它们使用直接重定向的方式，不需要前端 SDK

// 简化的 Creem 重定向函数
const getCreem = () => {
  return Promise.resolve({
    redirectToCheckout: async (options: { sessionId?: string; url?: string }) => {
      try {
        // 如果有直接的 URL，使用 URL 重定向
        if (options.url) {
          window.location.href = options.url;
          return { error: undefined };
        }
        
        // 如果只有 sessionId，构建 URL（这种情况下可能不适用于 Creem）
        if (options.sessionId) {
          console.warn('Creem uses direct URL redirection, sessionId may not be needed');
          return { error: new Error('Please use direct URL redirection for Creem') };
        }
        
        return { error: new Error('No URL or sessionId provided') };
      } catch (error) {
        return { error: error as Error };
      }
    }
  });
};

export default getCreem;
