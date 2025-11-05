import React, { useState, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface AlteredTaskData {
    id: number;
    roll_name: string;
    batch_name: string;
    sub_batch_name: string;
    total_quantity: number;
    estimated_start_date: string;
    due_date: string;
    status: string;
    sent_from_department: string;
    alteration_date: string;
    altered_by: string;
    altered_quantity: number;
    alteration_reason: string;
    attachments?: { name: string; count: number }[];
    quantity_remaining?: number;
}

interface AlteredTaskDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    taskData: AlteredTaskData;
    onStageChange?: () => void;
}

const AlteredTaskDetailsModal: React.FC<AlteredTaskDetailsModalProps> = ({
    isOpen,
    onClose,
    taskData,
    onStageChange
}) => {
    const [status, setStatus] = useState(taskData.status || 'New Arrival');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (taskData) {
            setStatus(taskData.status || 'New Arrival');
            // Load assigned workers for this altered task
            // This would be an API call in production
        }
    }, [taskData]);

    const handleSave = async () => {
        if (!taskData?.id) {
            alert('Task data is missing');
            return;
        }

        try {
            setSaving(true);
            const token = localStorage.getItem('token');

            if (!token) {
                alert('Authentication required. Please login again.');
                return;
            }

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/sub-batches/move-stage`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        departmentSubBatchId: taskData.id,
                        toStage: status,
                    }),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update stage');
            }

            const result = await response.json();

            if (result.success) {
                alert('Status updated successfully!');
                onClose();
                // Refresh the kanban board
                if (onStageChange) {
                    onStageChange();
                }
            } else {
                throw new Error(result.message || 'Failed to update stage');
            }
        } catch (error) {
            console.error('Error updating stage:', error);
            alert(error instanceof Error ? error.message : 'Failed to update status. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen || !taskData) return null;

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/50" onClick={onClose} />
                <div className="bg-white rounded-lg shadow-xl w-[95vw] max-w-[1400px] max-h-[95vh] overflow-hidden relative flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-300 bg-white">
                        <h3 className="text-lg font-bold text-orange-600">Altered Batch - Task Details</h3>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Alteration Alert Banner */}
                    <div className="px-6 py-4 bg-orange-100 border-b-2 border-orange-500">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="text-orange-600 mt-1" size={24} />
                            <div className="flex-1">
                                <p className="font-bold text-lg text-orange-900">
                                    ALTERED BATCH
                                </p>
                                <p className="text-sm text-orange-800 mt-1">
                                    This batch was altered from <strong>{taskData.sent_from_department}</strong>
                                </p>
                                {taskData.alteration_reason && (
                                    <div className="mt-2 p-3 bg-white rounded-lg border-l-4 border-orange-600">
                                        <p className="text-sm font-semibold text-orange-900">Alteration Reason:</p>
                                        <p className="text-sm text-gray-800 mt-1">{taskData.alteration_reason}</p>
                                    </div>
                                )}
                            </div>
                            {taskData.altered_quantity && (
                                <div className="px-4 py-2 rounded-lg font-bold text-xl bg-orange-600 text-white">
                                    {taskData.altered_quantity.toLocaleString()} pcs
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[calc(95vh-120px)]">
                        {/* Task Information */}
                        <div className="bg-white border border-gray-300 rounded-lg p-6 mb-6">
                            <h4 className="font-bold text-lg text-gray-900 mb-4">Task Information</h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left Column */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                                            Roll Name
                                        </label>
                                        <div className="text-gray-900 bg-gray-50 p-2 rounded border border-gray-200">
                                            {taskData.roll_name}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                                            Sub Batch Name
                                        </label>
                                        <div className="text-gray-900 bg-gray-50 p-2 rounded border border-gray-200">
                                            {taskData.sub_batch_name}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                                            Estimated Start Date
                                        </label>
                                        <div className="text-gray-900 bg-gray-50 p-2 rounded border border-gray-200">
                                            {new Date(taskData.estimated_start_date).toLocaleDateString('en-US')}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                                            Status
                                        </label>
                                        <select
                                            value={status}
                                            onChange={(e) => setStatus(e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="New Arrival">New Arrival</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Completed">Completed</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                                            Batch Name
                                        </label>
                                        <div className="text-gray-900 bg-gray-50 p-2 rounded border border-gray-200">
                                            {taskData.batch_name}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                                            Total Quantity
                                        </label>
                                        <div className="text-gray-900 bg-gray-50 p-2 rounded border border-gray-200">
                                            {taskData.total_quantity.toLocaleString()}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                                            Due Date
                                        </label>
                                        <div className="text-gray-900 bg-gray-50 p-2 rounded border border-gray-200">
                                            {new Date(taskData.due_date).toLocaleDateString('en-US')}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                                            Sent from Department
                                        </label>
                                        <div className="text-gray-900 bg-gray-50 p-2 rounded border border-gray-200">
                                            {taskData.sent_from_department}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Alteration Log */}
                        <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-6 mb-6">
                            <h4 className="font-bold text-lg text-orange-900 mb-4 flex items-center gap-2">
                                <AlertTriangle size={20} />
                                Alteration Log
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-orange-800 mb-1">
                                        Date
                                    </label>
                                    <div className="text-gray-900 bg-white p-2 rounded border border-orange-300">
                                        {new Date(taskData.alteration_date).toLocaleDateString('en-US')}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-orange-800 mb-1">
                                        Altered By
                                    </label>
                                    <div className="text-gray-900 bg-white p-2 rounded border border-orange-300">
                                        {taskData.altered_by}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-orange-800 mb-1">
                                        Quantity
                                    </label>
                                    <div className="text-orange-600 font-bold text-xl bg-white p-2 rounded border border-orange-300">
                                        {taskData.altered_quantity.toLocaleString()} pieces
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-orange-800 mb-1">
                                        Reason
                                    </label>
                                    <div className="text-gray-900 bg-white p-2 rounded border border-orange-300 min-h-[42px]">
                                        {taskData.alteration_reason || '-'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Attachments */}
                        {taskData.attachments && taskData.attachments.length > 0 && (
                            <div className="bg-white border border-gray-300 rounded-lg p-6 mb-6">
                                <h4 className="font-bold text-lg text-gray-900 mb-4">Attachments</h4>
                                <div className="flex flex-wrap gap-2">
                                    {taskData.attachments.map((attachment, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                        >
                                            {attachment.name} : {attachment.count}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-gray-400 bg-gray-50">
                        <div className="flex justify-between items-center">
                            <button
                                onClick={onClose}
                                disabled={saving}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AlteredTaskDetailsModal;
