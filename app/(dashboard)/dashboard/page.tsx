'use client';

import { useEffect, useState } from 'react';
import MetricCard from '@/app/components/MetricCard';
import { Users, DollarSign, TrendingUp, Target, Phone, Mail, Calendar, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Customer, Deal, Activity } from '@/types';

export default function DashboardPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all data from API
    Promise.all([
      fetch('/api/customers').then(res => res.json()),
      fetch('/api/deals').then(res => res.json()),
      fetch('/api/activities').then(res => res.json()),
    ]).then(([customersData, dealsData, activitiesData]) => {
      setCustomers(customersData);
      setDeals(dealsData);
      setActivities(activitiesData);
      setLoading(false);
    }).catch(error => {
      console.error('Error fetching data:', error);
      setLoading(false);
    });
  }, []);

  // Calculate metrics from real data
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.status === 'active').length;
  const totalDeals = deals.length;
  const closedDeals = deals.filter(d => d.stage === 'closed-won');
  const totalRevenue = closedDeals.reduce((sum, d) => sum + d.value, 0);
  const pipelineValue = deals.filter(d => d.stage !== 'closed-won' && d.stage !== 'closed-lost').reduce((sum, d) => sum + d.value, 0);
  const conversionRate = totalDeals > 0 ? (closedDeals.length / totalDeals) * 100 : 0;
  const avgDealSize = closedDeals.length > 0 ? totalRevenue / closedDeals.length : 0;

  // Calculate top performers
  const performerStats = deals.reduce((acc, deal) => {
    const assignedTo = deal.assignedTo || 'Unassigned';
    if (!acc[assignedTo]) {
      acc[assignedTo] = {
        name: assignedTo,
        dealsCount: 0,
        revenue: 0,
        wonDeals: 0,
        totalDeals: 0,
      };
    }
    acc[assignedTo].totalDeals++;
    if (deal.stage === 'closed-won') {
      acc[assignedTo].wonDeals++;
      acc[assignedTo].revenue += deal.value;
      acc[assignedTo].dealsCount++;
    }
    return acc;
  }, {} as Record<string, { name: string; dealsCount: number; revenue: number; wonDeals: number; totalDeals: number }>);

  const topPerformers = Object.values(performerStats)
    .map(performer => ({
      ...performer,
      performance: performer.totalDeals > 0 ? (performer.wonDeals / performer.totalDeals) * 100 : 0,
      target: performer.revenue * 1.2, // Assume target is 120% of current revenue
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 4);

  // Pipeline data by stage
  const pipelineData = [
    { stage: 'Prospecting', count: deals.filter(d => d.stage === 'prospecting').length, value: deals.filter(d => d.stage === 'prospecting').reduce((sum, d) => sum + d.value, 0) },
    { stage: 'Qualification', count: deals.filter(d => d.stage === 'qualification').length, value: deals.filter(d => d.stage === 'qualification').reduce((sum, d) => sum + d.value, 0) },
    { stage: 'Proposal', count: deals.filter(d => d.stage === 'proposal').length, value: deals.filter(d => d.stage === 'proposal').reduce((sum, d) => sum + d.value, 0) },
    { stage: 'Negotiation', count: deals.filter(d => d.stage === 'negotiation').length, value: deals.filter(d => d.stage === 'negotiation').reduce((sum, d) => sum + d.value, 0) },
    { stage: 'Closed Won', count: closedDeals.length, value: totalRevenue },
  ];

  // Helper functions
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Sales Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Welcome back! Here's what's happening with your sales today.</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          change={12.5}
          trend="up"
          period="vs last month"
          icon={<DollarSign className="w-6 h-6 text-blue-600" />}
        />
        <MetricCard
          title="Active Deals"
          value={totalDeals.toString()}
          change={8.3}
          trend="up"
          period="this month"
          icon={<Target className="w-6 h-6 text-green-600" />}
        />
        <MetricCard
          title="Conversion Rate"
          value={`${conversionRate.toFixed(1)}%`}
          change={-2.1}
          trend="down"
          period="vs last month"
          icon={<TrendingUp className="w-6 h-6 text-purple-600" />}
        />
        <MetricCard
          title="Avg Deal Size"
          value={formatCurrency(avgDealSize)}
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
                <YAxis stroke="#6b7280" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => [formatCurrency(value), 'Value']} />
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
                  label={({ stage, count }) => `${stage} (${count})`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pipelineData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [formatCurrency(value), 'Value']} />
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
            {activities.slice(0, 5).map((activity) => (
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
              <p className="text-2xl font-bold">{totalCustomers}</p>
              <p className="text-blue-100 text-sm">{activeCustomers} active</p>
            </div>
            <Users className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-linear-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Win Rate</p>
              <p className="text-2xl font-bold">{conversionRate.toFixed(1)}%</p>
              <p className="text-green-100 text-sm">{closedDeals.length} deals won</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-linear-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Pipeline Value</p>
              <p className="text-2xl font-bold">{formatCurrency(pipelineValue)}</p>
              <p className="text-purple-100 text-sm">Across {deals.filter(d => d.stage !== 'closed-won').length} deals</p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-200" />
          </div>
        </div>
      </div>
    </div>
  );
}

