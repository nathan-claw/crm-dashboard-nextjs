'use client';

import Card from '@/app/components/Card';
import { Target } from 'lucide-react';

export default function PipelinePage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Pipeline</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">View your sales pipeline</p>
      </div>

      <Card>
        <div className="text-center py-12">
          <Target className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Pipeline Management</h3>
          <p className="text-gray-500 dark:text-gray-400">Pipeline management features coming soon</p>
        </div>
      </Card>
    </div>
  );
}