'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/sections/hero/1/ui/button';
import { ArrowLeft, Download, Calendar, Image } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface HistoryItem {
  id: string;
  url: string;
  created_at: string;
}

interface HistoryData {
  data: HistoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [historyData, setHistoryData] = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  // 如果未登录，重定向到首页
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/');
      return;
    }

    fetchHistoryData(currentPage);
  }, [session, status, router, currentPage]);

  const fetchHistoryData = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/history?page=${page}&limit=12`);
      if (response.ok) {
        const data = await response.json();
        setHistoryData(data);
      } else {
        console.error('Failed to fetch history data');
      }
    } catch (error) {
      console.error('Error fetching history data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (url: string, id: string) => {
    setIsDownloading(id);
    try {
      // 使用我们的下载API
      const downloadUrl = `/api/download?url=${encodeURIComponent(url)}&filename=generated-image-${id}.webp`;
      
      // 通过fetch检查响应状态
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error(`下载失败: ${response.status}`);
      }
      
      // 获取blob数据
      const blob = await response.blob();
      
      // 创建一个临时链接并触发下载
      const downloadLink = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadLink;
      link.download = `generated-image-${id}.webp`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // 清理blob URL
      window.URL.revokeObjectURL(downloadLink);
    } catch (error) {
      console.error('Download failed:', error);
      alert('下载失败，请重试');
    } finally {
      setIsDownloading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary/20 to-muted/20 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="space-y-6">
            <Skeleton className="h-8 w-48" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!historyData?.data?.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary/20 to-muted/20 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <Button 
                  variant="ghost" 
                  onClick={() => router.push('/')}
                  className="mb-4 p-0 hover:bg-transparent"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
                <h1 className="text-3xl font-bold text-foreground">History</h1>
              </div>
            </div>

            {/* Empty State */}
            <Card className="border-2">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Image className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No images generated yet
                </h3>
                <Button onClick={() => router.push('/')}>
                  Start Generating
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/20 to-muted/20 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <Button 
                variant="ghost" 
                onClick={() => router.push('/')}
                className="mb-4 p-0 hover:bg-transparent"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
              <h1 className="text-3xl font-bold text-foreground">History</h1>
            </div>
          </div>

          {/* Image Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {historyData.data.map((item) => (
              <Card key={item.id} className="border-2 overflow-hidden group hover:shadow-lg transition-all duration-300">
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={item.url}
                    alt={`Generated image ${item.id}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleDownload(item.url, item.id)}
                      disabled={isDownloading === item.id}
                      className="bg-white/90 hover:bg-white text-black"
                    >
                      {isDownloading === item.id ? (
                        <>
                          <Skeleton className="w-4 h-4 mr-2" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                <CardContent className="p-3">
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatDate(item.created_at)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {historyData.pagination.totalPages > 1 && (
            <Card className="border-2">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * historyData.pagination.limit + 1} to {Math.min(currentPage * historyData.pagination.limit, historyData.pagination.total)} of {historyData.pagination.total} results
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm font-medium">
                      {currentPage} / {historyData.pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === historyData.pagination.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
