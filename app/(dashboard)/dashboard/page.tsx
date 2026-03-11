'use client';

import { useEffect, useState } from 'react';
import MetricCard from '@/app/components/MetricCard';
import { Users, DollarSign, TrendingUp, Target, Phone, Mail, Calendar, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface DashboardData {
  metrics: {
    totalCustomers: number;
    activeCustomers: number;
    totalDeals: number;
    closedDeals: number;
    lostDeals: number;
    openDeals: number;
    totalRevenue: number;
    pipelineValue: number;
    conversionRate: number;
    avgDealSize: number;
  };
  pipelineData: Array<{
    stage: string;
    count: number;
    value: number;
  }>;
  topPerformers: Array<{
    name: string;
    dealsCount: number;
    revenue: number;
    wonDeals: number;
    totalDeals: number;
    performance: number;
    target: number;
  }>;
  recentActivities: Array<{
    id: number;
    type: string;
    title: string;
    description: string | null;
    customerName: string | null;
    assignedTo: string | null;
    createdAt: string;
  }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch dashboard data');
        return res.json();
      })
      .then((dashboardData: DashboardData) => {
        setData(dashboardData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching dashboard:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call':
        return <Phone className="w-4 h-4 text-blue-500" />;
      case 'email':
        return <Mail className="w-4 h-4 text-green-500" />;
      case 'meeting':
        return <Calendar className="w-4 h-4 text-purple-500" />;
      case 'deal-created':
        return <Target className="w-4 h-4 text-orange-500" />;
      case 'deal-won':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const pieColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">Error loading dashboard: {error}</p>
        </div>
      </div>
    );
  }

  const { metrics, pipelineData, topPerformers, recentActivities } = data;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Sales Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Welcome back! Here&apos;s what&apos;s happening with your sales today.</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(metrics.totalRevenue)}
          change={12.5}
          trend="up"
          period="vs last month"
          icon={<DollarSign className="w-6 h-6 text-blue-600" />}
        />
        <MetricCard
          title="Active Deals"
          value={metrics.totalDeals.toString()}
          change={8.3}
          trend="up"
          period="this month"
          icon={<Target className="w-6 h-6 text-green-600" />}
        />
        <MetricCard
          title="Conversion Rate"
          value={`${metrics.conversionRate.toFixed(1)}%`}
          change={-2.1}
          trend="down"
          period="vs last month"
          icon={<TrendingUp className="w-6 h-6 text-purple-600" />}
        />
        <MetricCard
          title="Avg Deal Size"
          value={formatCurrency(metrics.avgDealSize)}
          change={15.7}
          trend="up"
          period="vs last quarter"
          icon={<Users className="w-6 h-6 text-orange-600" />}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline Value by Stage */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg card-shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Pipeline Value by Stage</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="stage" stroke="#6b7280" />
                <YAxis stroke="#6b7280" tickFormatter={(value) => `$${(Number(value) / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Value']} />
                <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pipeline Distribution */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg card-shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Pipeline Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pipelineData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }: { name?: string; value?: number }) => `${name || ''} (${value || 0})`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pipelineData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Value']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg card-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activities</h3>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="shrink-0 mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{activity.description}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{activity.customerName}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{activity.assignedTo}</span>
                  </div>
                </div>
                <div className="shrink-0 text-xs text-gray-400">
                  {formatTime(activity.createdAt)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg card-shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Performers</h3>
          <div className="space-y-4">
            {topPerformers.map((performer, index) => {
              const initials = performer.name.split(' ').map(n => n[0]).join('').toUpperCase();
              const progressPercentage = performer.target > 0 ? (performer.revenue / performer.target) * 100 : 0;

              return (
                <div key={index} className="flex items-center space-x-3">
                  <div className="shrink-0">
                    <div className="w-10 h-10 bg-linear-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-white">
                        {initials}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{performer.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{performer.dealsCount} deals won</p>
                    <div className="mt-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">{formatCurrency(performer.revenue)}</span>
                        <span className="font-medium text-gray-900 dark:text-white">{performer.performance.toFixed(0)}%</span>
                      </div>
                      <div className="mt-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div
                          className="bg-linear-to-r from-blue-500 to-purple-600 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-linear-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Customers</p>
              <p className="text-2xl font-bold">{metrics.totalCustomers}</p>
              <p className="text-blue-100 text-sm">{metrics.activeCustomers} active</p>
            </div>
            <Users className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-linear-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Win Rate</p>
              <p className="text-2xl font-bold">{metrics.conversionRate.toFixed(1)}%</p>
              <p className="text-green-100 text-sm">{metrics.closedDeals} deals won</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-linear-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Pipeline Value</p>
              <p className="text-2xl font-bold">{formatCurrency(metrics.pipelineValue)}</p>
              <p className="text-purple-100 text-sm">Across {metrics.openDeals} deals</p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-200" />
          </div>
        </div>
      </div>
    </div>
  );
}
