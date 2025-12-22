'use client';

import { useEffect, useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Target, 
  Users,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Activity as ActivityIcon
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { Customer, Deal, Activity } from '@/types';
import MetricCard from '@/app/components/MetricCard';

export default function AnalyticsPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
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

  // Calculate key metrics
  const totalRevenue = deals.filter(d => d.stage === 'closed-won').reduce((sum, d) => sum + d.value, 0);
  const pipelineValue = deals.filter(d => d.stage !== 'closed-won' && d.stage !== 'closed-lost').reduce((sum, d) => sum + d.value, 0);
  const avgDealSize = deals.filter(d => d.stage === 'closed-won').length > 0 
    ? totalRevenue / deals.filter(d => d.stage === 'closed-won').length 
    : 0;
  const conversionRate = deals.length > 0 
    ? (deals.filter(d => d.stage === 'closed-won').length / deals.length) * 100 
    : 0;

  // Revenue by month (simulated data based on deals)
  const revenueByMonth = [
    { month: 'Jan', revenue: totalRevenue * 0.15, deals: 8, target: totalRevenue * 0.18 },
    { month: 'Feb', revenue: totalRevenue * 0.12, deals: 6, target: totalRevenue * 0.18 },
    { month: 'Mar', revenue: totalRevenue * 0.18, deals: 10, target: totalRevenue * 0.18 },
    { month: 'Apr', revenue: totalRevenue * 0.14, deals: 7, target: totalRevenue * 0.18 },
    { month: 'May', revenue: totalRevenue * 0.16, deals: 9, target: totalRevenue * 0.18 },
    { month: 'Jun', revenue: totalRevenue * 0.25, deals: 12, target: totalRevenue * 0.18 },
  ];

  // Sales funnel data
  const funnelData = [
    { stage: 'Leads', count: customers.length, value: customers.length },
    { stage: 'Qualified', count: deals.length, value: deals.length },
    { stage: 'Proposal', count: deals.filter(d => ['proposal', 'negotiation', 'closed-won'].includes(d.stage)).length, value: deals.filter(d => ['proposal', 'negotiation', 'closed-won'].includes(d.stage)).length },
    { stage: 'Negotiation', count: deals.filter(d => ['negotiation', 'closed-won'].includes(d.stage)).length, value: deals.filter(d => ['negotiation', 'closed-won'].includes(d.stage)).length },
    { stage: 'Closed Won', count: deals.filter(d => d.stage === 'closed-won').length, value: deals.filter(d => d.stage === 'closed-won').length },
  ];

  // Deal stage distribution
  const stageDistribution = [
    { stage: 'Prospecting', count: deals.filter(d => d.stage === 'prospecting').length, value: deals.filter(d => d.stage === 'prospecting').reduce((sum, d) => sum + d.value, 0) },
    { stage: 'Qualification', count: deals.filter(d => d.stage === 'qualification').length, value: deals.filter(d => d.stage === 'qualification').reduce((sum, d) => sum + d.value, 0) },
    { stage: 'Proposal', count: deals.filter(d => d.stage === 'proposal').length, value: deals.filter(d => d.stage === 'proposal').reduce((sum, d) => sum + d.value, 0) },
    { stage: 'Negotiation', count: deals.filter(d => d.stage === 'negotiation').length, value: deals.filter(d => d.stage === 'negotiation').reduce((sum, d) => sum + d.value, 0) },
    { stage: 'Closed Won', count: deals.filter(d => d.stage === 'closed-won').length, value: deals.filter(d => d.stage === 'closed-won').reduce((sum, d) => sum + d.value, 0) },
  ];

  // Team performance radar
  const teamPerformance = deals.reduce((acc, deal) => {
    const assignedTo = deal.assignedTo || 'Unassigned';
    if (!acc[assignedTo]) {
      acc[assignedTo] = {
        name: assignedTo,
        deals: 0,
        revenue: 0,
        activities: 0,
        winRate: 0,
        avgDealSize: 0,
      };
    }
    acc[assignedTo].deals++;
    if (deal.stage === 'closed-won') {
      acc[assignedTo].revenue += deal.value;
      acc[assignedTo].winRate++;
    }
    return acc;
  }, {} as Record<string, any>);

  const radarData = Object.values(teamPerformance).slice(0, 5).map((member: any) => ({
    name: member.name,
    deals: (member.deals / Math.max(...Object.values(teamPerformance).map((m: any) => m.deals))) * 100,
    revenue: (member.revenue / Math.max(...Object.values(teamPerformance).map((m: any) => m.revenue))) * 100,
    winRate: member.deals > 0 ? (member.winRate / member.deals) * 100 : 0,
  }));

  // Activity trends
  const activityTrends = [
    { day: 'Mon', calls: 12, emails: 24, meetings: 8 },
    { day: 'Tue', calls: 15, emails: 28, meetings: 10 },
    { day: 'Wed', calls: 18, emails: 32, meetings: 12 },
    { day: 'Thu', calls: 14, emails: 26, meetings: 9 },
    { day: 'Fri', calls: 16, emails: 30, meetings: 11 },
    { day: 'Sat', calls: 5, emails: 10, meetings: 2 },
    { day: 'Sun', calls: 3, emails: 8, meetings: 1 },
  ];

  // Customer source distribution
  const sourceDistribution = customers.reduce((acc, customer) => {
    const source = customer.source || 'unknown';
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sourceData = Object.entries(sourceDistribution).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Comprehensive insights and performance metrics</p>
        </div>
        <div className="flex items-center space-x-2">
          {(['7d', '30d', '90d', '1y'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : '1 Year'}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          change={18.2}
          trend="up"
          period="vs last period"
          icon={<DollarSign className="w-6 h-6 text-blue-600" />}
        />
        <MetricCard
          title="Pipeline Value"
          value={formatCurrency(pipelineValue)}
          change={12.5}
          trend="up"
          period="vs last period"
          icon={<Target className="w-6 h-6 text-green-600" />}
        />
        <MetricCard
          title="Avg Deal Size"
          value={formatCurrency(avgDealSize)}
          change={-3.2}
          trend="down"
          period="vs last period"
          icon={<BarChart3 className="w-6 h-6 text-purple-600" />}
        />
        <MetricCard
          title="Conversion Rate"
          value={`${conversionRate.toFixed(1)}%`}
          change={5.8}
          trend="up"
          period="vs last period"
          icon={<TrendingUp className="w-6 h-6 text-orange-600" />}
        />
      </div>

      {/* Revenue Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg card-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue Trends</h3>
            <div className="flex items-center space-x-2">
              <ArrowUpRight className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-green-500">+24.5%</span>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueByMonth}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => [formatCurrency(value), 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRevenue)" />
                <Line type="monotone" dataKey="target" stroke="#ef4444" strokeDasharray="5 5" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg card-shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Deals Closed by Month</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Bar dataKey="deals" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Sales Funnel & Stage Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg card-shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sales Funnel</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" stroke="#6b7280" />
                <YAxis dataKey="stage" type="category" stroke="#6b7280" width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-5 gap-2">
            {funnelData.map((stage, index) => (
              <div key={stage.stage} className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stage.count}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{stage.stage}</div>
                {index < funnelData.length - 1 && (
                  <div className="text-xs text-gray-400 mt-1">
                    {((stage.count / funnelData[index + 1].count) * 100).toFixed(0)}% →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg card-shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Pipeline by Stage</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stageDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ stage, count }) => `${stage} (${count})`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stageDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [formatCurrency(value), 'Value']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Team Performance & Activity Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg card-shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Team Performance</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="name" stroke="#6b7280" />
                <PolarRadiusAxis stroke="#6b7280" />
                <Radar name="Deals" dataKey="deals" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                <Radar name="Revenue" dataKey="revenue" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                <Radar name="Win Rate" dataKey="winRate" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg card-shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Activity Trends</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activityTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="calls" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="emails" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="meetings" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Customer Sources & Key Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg card-shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Customer Sources</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg card-shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Key Insights</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Revenue Growth</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Your revenue has increased by 24.5% compared to the previous period. Keep up the great work!
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Target className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Pipeline Health</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Your pipeline value is {formatCurrency(pipelineValue)}, representing strong future potential.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Users className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Team Performance</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Top performers are maintaining a {conversionRate.toFixed(1)}% conversion rate across all deals.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <ActivityIcon className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Activity Trends</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Peak activity days are Wednesday and Friday. Consider scheduling important calls during these times.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
