'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, DollarSign, Calendar, User, TrendingUp, FileText, Building2 } from 'lucide-react';
import { Deal } from '@/types';
import { format } from 'date-fns';

export interface DealDetailModalProps {
  deal: Deal | null;
  isOpen: boolean;
  onClose: () => void;
}

const STAGE_COLORS: Record<string, string> = {
  'prospecting': 'bg-gray-100 text-gray-800 border-gray-300',
  'qualification': 'bg-blue-100 text-blue-800 border-blue-300',
  'proposal': 'bg-purple-100 text-purple-800 border-purple-300',
  'negotiation': 'bg-orange-100 text-orange-800 border-orange-300',
  'closed-won': 'bg-green-100 text-green-800 border-green-300',
  'closed-lost': 'bg-red-100 text-red-800 border-red-300',
};

const STAGE_NAMES: Record<string, string> = {
  'prospecting': 'Prospecting',
  'qualification': 'Qualification',
  'proposal': 'Proposal',
  'negotiation': 'Negotiation',
  'closed-won': 'Closed Won',
  'closed-lost': 'Closed Lost',
};

export default function DealDetailModal({ deal, isOpen, onClose }: DealDetailModalProps) {
  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !deal) return null;

  const stageColor = STAGE_COLORS[deal.stage] || 'bg-gray-100 text-gray-800 border-gray-300';
  const stageName = STAGE_NAMES[deal.stage] || deal.stage;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 id="modal-title" className="text-xl font-semibold text-gray-900 dark:text-white">
            Deal Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Title and Stage */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              {deal.title}
            </h3>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${stageColor}`}>
              {stageName}
            </span>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Deal Value */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm font-medium">Deal Value</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${deal.value?.toLocaleString() || 0}
              </p>
            </div>

            {/* Probability */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">Probability</span>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {deal.probability || 0}%
                </p>
                <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${deal.probability || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4">
            {/* Customer */}
            {deal.customerName && (
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Customer</p>
                  <p className="text-base text-gray-900 dark:text-white">{deal.customerName}</p>
                </div>
              </div>
            )}

            {/* Assigned To */}
            {deal.assignedTo && (
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Assigned To</p>
                  <p className="text-base text-gray-900 dark:text-white">{deal.assignedTo}</p>
                </div>
              </div>
            )}

            {/* Expected Close Date */}
            {deal.expectedCloseDate && (
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Expected Close Date</p>
                  <p className="text-base text-gray-900 dark:text-white">
                    {format(new Date(deal.expectedCloseDate), 'MMMM d, yyyy')}
                  </p>
                </div>
              </div>
            )}

            {/* Actual Close Date */}
            {deal.actualCloseDate && (
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Actual Close Date</p>
                  <p className="text-base text-gray-900 dark:text-white">
                    {format(new Date(deal.actualCloseDate), 'MMMM d, yyyy')}
                  </p>
                </div>
              </div>
            )}

            {/* Description */}
            {deal.description && (
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Description</p>
                  <p className="text-base text-gray-900 dark:text-white whitespace-pre-wrap">
                    {deal.description}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Timestamps */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-400">Created</p>
                <p className="text-gray-900 dark:text-white">
                  {format(new Date(deal.createdAt), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Last Updated</p>
                <p className="text-gray-900 dark:text-white">
                  {format(new Date(deal.updatedAt), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
