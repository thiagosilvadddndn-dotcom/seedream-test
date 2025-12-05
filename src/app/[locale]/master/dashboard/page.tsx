'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/sections/hero/1/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Users, CreditCard, LogOut, Menu, History } from 'lucide-react';

type TabType = 'users' | 'subscriptions' | 'history';

interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  credits: number;
  created_at: string;
}

interface Subscription {
  id: string;
  user_id: string;
  user_email?: string;
  plan_name: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  credits_per_month: number;
}

interface GenerationHistory {
  id: string;
  user_id: string;
  user_email?: string;
  url: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [userFilter, setUserFilter] = useState('');
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<Subscription[]>([]);
  const [subscriptionFilter, setSubscriptionFilter] = useState('');
  const [history, setHistory] = useState<GenerationHistory[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<GenerationHistory[]>([]);
  const [historyFilter, setHistoryFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 检查登录状态
    const token = sessionStorage.getItem('admin-token');
    if (!token) {
      router.push('/master');
      return;
    }

    // 加载数据
    loadData();
  }, [router]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const token = sessionStorage.getItem('admin-token');
      const headers = {
        'Authorization': `Basic ${token}`,
      };

      const [usersResponse, subscriptionsResponse, historyResponse] = await Promise.all([
        fetch('/api/admin/users', { headers }),
        fetch('/api/admin/subscriptions', { headers }),
        fetch('/api/admin/history', { headers }),
      ]);

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData.users || []);
        setFilteredUsers(usersData.users || []);
      }

      if (subscriptionsResponse.ok) {
        const subscriptionsData = await subscriptionsResponse.json();
        setSubscriptions(subscriptionsData.subscriptions || []);
        setFilteredSubscriptions(subscriptionsData.subscriptions || []);
      }

      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setHistory(historyData.history || []);
        setFilteredHistory(historyData.history || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin-token');
    router.push('/master');
  };

  const handleUserFilter = (filterValue: string) => {
    setUserFilter(filterValue);
    
    if (!filterValue.trim()) {
      // 如果筛选条件为空，显示所有用户
      setFilteredUsers(users);
    } else {
      // 根据邮箱筛选
      const filtered = users.filter(user => 
        user.email.toLowerCase().includes(filterValue.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  };

  const handleSubscriptionFilter = (filterValue: string) => {
    setSubscriptionFilter(filterValue);
    
    if (!filterValue.trim()) {
      // 如果筛选条件为空，显示所有订阅
      setFilteredSubscriptions(subscriptions);
    } else {
      // 根据用户ID或邮箱筛选
      const filtered = subscriptions.filter(subscription => 
        subscription.user_id.toLowerCase().includes(filterValue.toLowerCase()) ||
        (subscription.user_email && subscription.user_email.toLowerCase().includes(filterValue.toLowerCase()))
      );
      setFilteredSubscriptions(filtered);
    }
  };

  const handleHistoryFilter = (filterValue: string) => {
    setHistoryFilter(filterValue);
    
    if (!filterValue.trim()) {
      // 如果筛选条件为空，显示所有记录
      setFilteredHistory(history);
    } else {
      // 根据用户ID或邮箱筛选
      const filtered = history.filter(record => 
        record.user_id.toLowerCase().includes(filterValue.toLowerCase()) ||
        (record.user_email && record.user_email.toLowerCase().includes(filterValue.toLowerCase()))
      );
      setFilteredHistory(filtered);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'canceled':
        return 'text-red-600 bg-red-100';
      case 'past_due':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* 侧边栏 */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white shadow-lg transition-all duration-300`}>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <h1 className={`font-bold text-xl ${sidebarOpen ? 'block' : 'hidden'}`}>
              管理后台
            </h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <nav className="mt-8">
          <div className="px-4 space-y-2">
            <Button
              variant={activeTab === 'users' ? 'default' : 'ghost'}
              className={`w-full justify-start ${!sidebarOpen && 'px-2'}`}
              onClick={() => setActiveTab('users')}
            >
              <Users className="h-4 w-4" />
              {sidebarOpen && <span className="ml-2">用户管理</span>}
            </Button>
            
            <Button
              variant={activeTab === 'subscriptions' ? 'default' : 'ghost'}
              className={`w-full justify-start ${!sidebarOpen && 'px-2'}`}
              onClick={() => setActiveTab('subscriptions')}
            >
              <CreditCard className="h-4 w-4" />
              {sidebarOpen && <span className="ml-2">订阅情况</span>}
            </Button>
            
            <Button
              variant={activeTab === 'history' ? 'default' : 'ghost'}
              className={`w-full justify-start ${!sidebarOpen && 'px-2'}`}
              onClick={() => setActiveTab('history')}
            >
              <History className="h-4 w-4" />
              {sidebarOpen && <span className="ml-2">历史记录</span>}
            </Button>
          </div>

          <div className="absolute bottom-4 left-4 right-4">
            <Button
              variant="ghost"
              className={`w-full justify-start text-red-600 hover:text-red-700 ${!sidebarOpen && 'px-2'}`}
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              {sidebarOpen && <span className="ml-2">退出登录</span>}
            </Button>
          </div>
        </nav>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {/* 用户管理 */}
          {activeTab === 'users' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  用户管理 ({filteredUsers.length} 位用户)
                </CardTitle>
                <div className="mt-4">
                  <Input
                    placeholder="根据邮箱筛选用户..."
                    value={userFilter}
                    onChange={(e) => handleUserFilter(e.target.value)}
                    className="max-w-md"
                  />
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">加载中...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full table-auto">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">头像</th>
                          <th className="text-left py-3 px-4">ID</th>
                          <th className="text-left py-3 px-4">邮箱</th>
                          <th className="text-left py-3 px-4">姓名</th>
                          <th className="text-left py-3 px-4">积分</th>
                          <th className="text-left py-3 px-4">注册时间</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((user) => (
                          <tr key={user.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">
                              {user.avatar ? (
                                <img
                                  src={user.avatar}
                                  alt={user.name || user.email}
                                  className="w-8 h-8 rounded-full"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                                  <span className="text-xs text-gray-600">
                                    {(user.name || user.email).charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-4 font-mono text-sm">{user.id}</td>
                            <td className="py-3 px-4">{user.email}</td>
                            <td className="py-3 px-4">{user.name || '-'}</td>
                            <td className="py-3 px-4">
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                                {user.credits}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                              {formatDate(user.created_at)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    {filteredUsers.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        {userFilter ? '没有找到匹配的用户' : '暂无用户数据'}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* 订阅情况 */}
          {activeTab === 'subscriptions' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  订阅情况 ({filteredSubscriptions.length} 个订阅)
                </CardTitle>
                <div className="mt-4">
                  <Input
                    placeholder="根据用户ID或邮箱筛选..."
                    value={subscriptionFilter}
                    onChange={(e) => handleSubscriptionFilter(e.target.value)}
                    className="max-w-md"
                  />
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">加载中...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full table-auto">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">订阅ID</th>
                          <th className="text-left py-3 px-4">用户ID</th>
                          <th className="text-left py-3 px-4">用户邮箱</th>
                          <th className="text-left py-3 px-4">套餐名称</th>
                          <th className="text-left py-3 px-4">状态</th>
                          <th className="text-left py-3 px-4">周期开始</th>
                          <th className="text-left py-3 px-4">周期结束</th>
                          <th className="text-left py-3 px-4">月积分</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredSubscriptions.map((subscription) => (
                          <tr key={subscription.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 font-mono text-sm">{subscription.id}</td>
                            <td className="py-3 px-4 font-mono text-sm">{subscription.user_id}</td>
                            <td className="py-3 px-4">{subscription.user_email || '-'}</td>
                            <td className="py-3 px-4">
                              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm">
                                {subscription.plan_name}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(subscription.status)}`}>
                                {subscription.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm">
                              {formatDate(subscription.current_period_start)}
                            </td>
                            <td className="py-3 px-4 text-sm">
                              {formatDate(subscription.current_period_end)}
                            </td>
                            <td className="py-3 px-4">
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                                {subscription.credits_per_month}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    {filteredSubscriptions.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        {subscriptionFilter ? '没有找到匹配的订阅' : '暂无订阅数据'}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* 历史记录 */}
          {activeTab === 'history' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <History className="h-5 w-5 mr-2" />
                  历史记录 ({filteredHistory.length} 条记录)
                </CardTitle>
                <div className="mt-4">
                  <Input
                    placeholder="根据用户ID或邮箱筛选..."
                    value={historyFilter}
                    onChange={(e) => handleHistoryFilter(e.target.value)}
                    className="max-w-md"
                  />
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">加载中...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full table-auto">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">记录ID</th>
                          <th className="text-left py-3 px-4">用户ID</th>
                          <th className="text-left py-3 px-4">用户邮箱</th>
                          <th className="text-left py-3 px-4">图片URL</th>
                          <th className="text-left py-3 px-4">创建时间</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredHistory.map((record) => (
                          <tr key={record.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 font-mono text-sm">{record.id}</td>
                            <td className="py-3 px-4 font-mono text-sm">{record.user_id}</td>
                            <td className="py-3 px-4">{record.user_email || '-'}</td>
                            <td className="py-3 px-4">
                              <a 
                                href={record.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 underline truncate block max-w-xs"
                              >
                                {record.url}
                              </a>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                              {formatDate(record.created_at)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    {filteredHistory.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        {historyFilter ? '没有找到匹配的记录' : '暂无历史记录'}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}