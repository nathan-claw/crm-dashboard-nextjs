'use client';

import { useEffect, useState } from 'react';
import { DollarSign } from 'lucide-react';
import { Deal } from '@/types';
import DealDetailModal from '@/app/components/DealDetailModal';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  DragOverEvent,
  useDroppable,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Draggable Deal Card Component
function DraggableDealCard({ deal, onClick }: { deal: Deal; onClick: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
    >
      <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-1">
        {deal.title}
      </h4>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
        {deal.customerName || 'No customer'}
      </p>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-900 dark:text-white">
          ${deal.value?.toLocaleString() || 0}
        </span>
        <span className="text-xs text-gray-500">
          {deal.probability || 0}%
        </span>
      </div>
    </div>
  );
}

// Droppable Stage Column Component
function DroppableStage({
  stage,
  deals,
  stageTotal,
  onDealClick,
}: {
  stage: { id: string; name: string; color: string };
  deals: Deal[];
  stageTotal: number;
  onDealClick: (deal: Deal) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  });

  return (
    <div className="flex flex-col">
      <div className={`${stage.color} border-2 rounded-lg p-4 mb-2`}>
        <h3 className="font-semibold text-gray-900 mb-1">{stage.name}</h3>
        <div className="flex items-center text-sm text-gray-600">
          <DollarSign className="w-4 h-4 mr-1" />
          ${stageTotal.toLocaleString()}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {deals.length} {deals.length === 1 ? 'deal' : 'deals'}
        </div>
      </div>

      <SortableContext
        items={deals.map(d => d.id.toString())}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          className={`space-y-2 flex-1 min-h-[200px] rounded-lg p-2 transition-colors ${
            isOver ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-dashed border-blue-400' : ''
          }`}
        >
          {deals.map(deal => (
            <DraggableDealCard
              key={deal.id}
              deal={deal}
              onClick={() => onDealClick(deal)}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

export default function PipelinePage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px of movement required before drag starts
      },
    })
  );

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      const response = await fetch('/api/deals');
      const data = await response.json();
      setDeals(data);
    } catch (error) {
      console.error('Error fetching deals:', error);
    } finally {
      setLoading(false);
    }
  };

  const stages = [
    { id: 'prospecting', name: 'Prospecting', color: 'bg-gray-100 border-gray-300' },
    { id: 'qualification', name: 'Qualification', color: 'bg-blue-50 border-blue-300' },
    { id: 'proposal', name: 'Proposal', color: 'bg-purple-50 border-purple-300' },
    { id: 'negotiation', name: 'Negotiation', color: 'bg-orange-50 border-orange-300' },
    { id: 'closed-won', name: 'Closed Won', color: 'bg-green-50 border-green-300' },
  ];

  const getDealsByStage = (stageId: string) => {
    return deals.filter(deal => deal.stage === stageId);
  };

  const getStageTotal = (stageId: string) => {
    return getDealsByStage(stageId).reduce((sum, deal) => sum + (deal.value || 0), 0);
  };

  const handleDealClick = (deal: Deal) => {
    setSelectedDeal(deal);
    setIsDetailModalOpen(true);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const dealId = event.active.id;
    const deal = deals.find(d => d.id.toString() === dealId);
    setActiveDeal(deal || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDeal(null);

    if (!over) return;

    const dealId = active.id;
    const deal = deals.find(d => d.id.toString() === dealId);
    
    if (!deal) return;

    // Check if dropped over a stage column
    const stageId = over.id.toString();
    const validStages = stages.map(s => s.id);
    
    if (validStages.includes(stageId) && deal.stage !== stageId) {
      // Update deal stage optimistically
      setDeals(prevDeals =>
        prevDeals.map(d =>
          d.id === deal.id ? { ...d, stage: stageId } : d
        )
      );

      // Update on server
      try {
        const response = await fetch(`/api/deals/${deal.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...deal,
            stage: stageId,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update deal');
        }

        // Refresh deals to get updated data
        await fetchDeals();
      } catch (error) {
        console.error('Error updating deal:', error);
        // Revert optimistic update on error
        setDeals(prevDeals =>
          prevDeals.map(d =>
            d.id === deal.id ? { ...d, stage: deal.stage } : d
          )
        );
      }
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sales Pipeline</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Visualize your deals across different stages - click to view details, drag to move between stages
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading pipeline...</div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {stages.map(stage => {
              const stageDeals = getDealsByStage(stage.id);
              const stageTotal = getStageTotal(stage.id);

              return (
                <DroppableStage
                  key={stage.id}
                  stage={stage}
                  deals={stageDeals}
                  stageTotal={stageTotal}
                  onDealClick={handleDealClick}
                />
              );
            })}
          </div>

          <DragOverlay>
            {activeDeal ? (
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg opacity-90 cursor-grabbing">
                <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-1">
                  {activeDeal.title}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  {activeDeal.customerName || 'No customer'}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    ${activeDeal.value?.toLocaleString() || 0}
                  </span>
                  <span className="text-xs text-gray-500">
                    {activeDeal.probability || 0}%
                  </span>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Deal Detail Modal */}
      <DealDetailModal
        deal={selectedDeal}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedDeal(null);
        }}
      />
    </div>
  );
}
