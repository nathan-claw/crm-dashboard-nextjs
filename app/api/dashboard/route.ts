import { NextResponse } from 'next/server';
import { db } from '@/db';
import { customers, deals, activities } from '@/db/schema';
import { desc, sql } from 'drizzle-orm';

export async function GET() {
  try {
    // Fetch all data in parallel
    const [allCustomers, allDeals, recentActivities] = await Promise.all([
      db.select().from(customers),
      db.select().from(deals),
      db
        .select()
        .from(activities)
        .orderBy(desc(activities.createdAt))
        .limit(10),
    ]);

    // Calculate customer metrics
    const totalCustomers = allCustomers.length;
    const activeCustomers = allCustomers.filter(c => c.status === 'active').length;

    // Calculate deal metrics
    const totalDeals = allDeals.length;
    const closedDeals = allDeals.filter(d => d.stage === 'closed-won');
    const lostDeals = allDeals.filter(d => d.stage === 'closed-lost');
    const openDeals = allDeals.filter(d => d.stage !== 'closed-won' && d.stage !== 'closed-lost');
    
    const totalRevenue = closedDeals.reduce((sum, d) => sum + (d.value || 0), 0);
    const pipelineValue = openDeals.reduce((sum, d) => sum + (d.value || 0), 0);
    const conversionRate = totalDeals > 0 ? (closedDeals.length / totalDeals) * 100 : 0;
    const avgDealSize = closedDeals.length > 0 ? totalRevenue / closedDeals.length : 0;

    // Pipeline data by stage
    const stages = ['prospecting', 'qualification', 'proposal', 'negotiation', 'closed-won'];
    const pipelineData = stages.map(stage => {
      const stageDeals = allDeals.filter(d => d.stage === stage);
      return {
        stage: stage.charAt(0).toUpperCase() + stage.slice(1).replace('-', ' '),
        count: stageDeals.length,
        value: stageDeals.reduce((sum, d) => sum + (d.value || 0), 0),
      };
    });

    // Top performers
    const performerStats = allDeals.reduce((acc, deal) => {
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
        acc[assignedTo].revenue += deal.value || 0;
        acc[assignedTo].dealsCount++;
      }
      return acc;
    }, {} as Record<string, { name: string; dealsCount: number; revenue: number; wonDeals: number; totalDeals: number }>);

    const topPerformers = Object.values(performerStats)
      .map(performer => ({
        ...performer,
        performance: performer.totalDeals > 0 ? (performer.wonDeals / performer.totalDeals) * 100 : 0,
        target: performer.revenue * 1.2,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 4);

    return NextResponse.json({
      metrics: {
        totalCustomers,
        activeCustomers,
        totalDeals,
        closedDeals: closedDeals.length,
        lostDeals: lostDeals.length,
        openDeals: openDeals.length,
        totalRevenue,
        pipelineValue,
        conversionRate,
        avgDealSize,
      },
      pipelineData,
      topPerformers,
      recentActivities,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
