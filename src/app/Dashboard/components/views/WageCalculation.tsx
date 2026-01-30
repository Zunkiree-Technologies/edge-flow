"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import axios from "axios";
import {
  DollarSign, Users, TrendingDown, Award,
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight, ArrowUpDown, Download,
  Check, Search, ArrowLeft, X, CreditCard, Wallet
} from "lucide-react";
import Loader from "@/app/Components/Loader";
import NepaliDatePicker from "@/app/Components/NepaliDatePicker";
import { useToast } from "@/app/Components/ToastContext";

// Interfaces
interface FilterOption {
  value: string;
  label: string;
  description?: string;
}

interface WorkerWageSummary {
  worker_id: number;
  worker_name: string;
  // Gross wages (before deductions)
  gross_billable_wages: number;
  // Deductions from altered/rejected items
  altered_deduction: number;
  altered_quantity: number;
  rejected_deduction: number;
  rejected_quantity: number;
  // Net wages (after deductions) - this is what the worker actually earns
  total_billable_wages: number;
  total_non_billable_wages: number;
  total_quantity_worked: number;
  billable_quantity: number;
  non_billable_quantity: number;
  total_entries: number;
  billable_entries: number;
  non_billable_entries: number;
}

interface DetailedWageLog {
  id: number;
  work_date: string;
  sub_batch_name: string;
  quantity_worked: number;
  unit_price: number;
  amount: number;
  is_billable: boolean;
  activity_type: string | null;
  particulars: string | null;
}

interface Department {
  id: number;
  name: string;
}

// Payment-related interfaces
interface Payment {
  id: number;
  worker_id: number;
  amount: number;
  payment_type: 'DATE_RANGE' | 'SUB_BATCH' | 'DIRECT';
  payment_method: 'CASH' | 'BANK_TRANSFER' | 'CHECK' | 'MOBILE_WALLET';
  payment_date: string;
  reference_number?: string;
  remarks?: string;
  start_date?: string;
  end_date?: string;
  sub_batch_id?: number;
  sub_batch?: { id: number; name: string };
  worker?: { id: number; name: string };
  // Void fields
  is_voided?: boolean;
  void_reason?: string;
  voided_at?: string;
}

interface WorkerSubBatch {
  id: number;
  name: string;
}

interface PaymentSummary {
  total_paid: number;
  total_payments: number;
  by_method: Record<string, number>;
  by_type: Record<string, number>;
}

// Custom Filter Dropdown Component
const FilterDropdown = ({
  label,
  options,
  value,
  onChange,
  searchable = true,
  icon,
}: {
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  searchable?: boolean;
  icon?: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find(opt => opt.value === value);
  const displayLabel = selectedOption?.label || label;

  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (opt.description && opt.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchQuery("");
  };

  const isActive = value !== "all";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 text-sm border rounded-md transition-all duration-200 ${
          isActive
            ? "border-[#2272B4] bg-blue-50 text-[#2272B4]"
            : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
        }`}
      >
        {icon && <span className="flex-shrink-0">{icon}</span>}
        <span className="max-w-[150px] truncate">{displayLabel}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
          <div className="absolute -top-2 left-4 w-4 h-4 bg-white border-l border-t border-gray-200 transform rotate-45" />
          {searchable && (
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#2272B4] focus:border-transparent"
                />
              </div>
            </div>
          )}
          <div className="max-h-64 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">No options found</div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-start gap-3 ${
                    value === option.value ? "bg-blue-50" : ""
                  }`}
                >
                  <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    value === option.value ? "border-[#2272B4] bg-[#2272B4]" : "border-gray-300"
                  }`}>
                    {value === option.value && <Check className="w-2.5 h-2.5 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium ${value === option.value ? "text-[#2272B4]" : "text-gray-900"}`}>
                      {option.label}
                    </div>
                    {option.description && (
                      <div className="text-xs text-gray-500 mt-0.5">{option.description}</div>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const WageCalculation = () => {
  const { showToast, showConfirm } = useToast();

  // View state
  const [activeView, setActiveView] = useState<'all' | 'detail'>('all');
  const [selectedWorkerForDetail, setSelectedWorkerForDetail] = useState<WorkerWageSummary | null>(null);

  // Data states
  const [allWorkersWages, setAllWorkersWages] = useState<WorkerWageSummary[]>([]);
  const [workerDetailedLogs, setWorkerDetailedLogs] = useState<DetailedWageLog[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  // Payment-related states
  const [workerPayments, setWorkerPayments] = useState<Payment[]>([]);
  const [workerPaymentSummary, setWorkerPaymentSummary] = useState<PaymentSummary | null>(null);
  const [workerSubBatches, setWorkerSubBatches] = useState<WorkerSubBatch[]>([]);
  const [totalPaidThisMonth, setTotalPaidThisMonth] = useState(0);

  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentFormData, setPaymentFormData] = useState({
    payment_type: 'DIRECT' as 'DATE_RANGE' | 'SUB_BATCH' | 'DIRECT',
    payment_method: 'CASH' as 'CASH' | 'BANK_TRANSFER' | 'CHECK' | 'MOBILE_WALLET',
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    reference_number: '',
    remarks: '',
    start_date: '',
    end_date: '',
    sub_batch_id: '',
  });
  const [calculatedAmount, setCalculatedAmount] = useState<number | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Void modal state
  const [showVoidModal, setShowVoidModal] = useState(false);
  const [voidPaymentId, setVoidPaymentId] = useState<number | null>(null);
  const [voidReason, setVoidReason] = useState('');
  const [voidLoading, setVoidLoading] = useState(false);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  // Dashboard summary
  const [dashboardStats, setDashboardStats] = useState({
    totalBillableWages: 0,
    totalNonBillableWages: 0,
    totalAlteredDeduction: 0,
    totalRejectedDeduction: 0,
    totalWorkers: 0,
    topEarner: null as WorkerWageSummary | null,
  });

  // Filter states (HubSpot-style)
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Sorting states
  const [sortColumn, setSortColumn] = useState<string>("total_billable_wages");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  const API = process.env.NEXT_PUBLIC_API_URL;

  // Fetch departments
  const fetchDepartments = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/departments`);
      setDepartments(res.data);
    } catch {
      // Departments fetch failed silently
    }
  }, [API]);

  // Helper to check if date is Nepali (year > 2050)
  const isNepaliDate = (dateStr: string): boolean => {
    if (!dateStr) return false;
    const year = parseInt(dateStr.split('-')[0]);
    return year > 2050; // Nepali years are 2080+, Gregorian are 2024+
  };

  // Convert Nepali date to approximate Gregorian date for API filtering
  // Note: This is a rough conversion (-57 years) for filtering purposes
  // The backend now stores dates correctly, but old data may still have wrong dates
  const convertNepaliToGregorianForFilter = (nepaliDateStr: string): string => {
    if (!nepaliDateStr || !isNepaliDate(nepaliDateStr)) return nepaliDateStr;
    const [year, month, day] = nepaliDateStr.split('-');
    const gregorianYear = parseInt(year) - 57; // Approximate conversion
    return `${gregorianYear}-${month}-${day}`;
  };

  // Fetch all workers wages
  const fetchAllWorkersWages = useCallback(async (deptFilter?: string, start?: string, end?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      const dept = deptFilter ?? selectedDepartment;
      const startD = start ?? startDate;
      const endD = end ?? endDate;

      // Convert Nepali dates to Gregorian for API filtering
      // Backend now stores dates correctly, but we convert here for filtering
      if (startD) {
        const convertedStart = convertNepaliToGregorianForFilter(startD);
        params.append('start_date', convertedStart);
      }
      if (endD) {
        const convertedEnd = convertNepaliToGregorianForFilter(endD);
        params.append('end_date', convertedEnd);
      }

      if (dept !== 'all') params.append('department_id', dept);

      const url = `${API}/wages/all?${params.toString()}`;

      const response = await axios.get(url);

      const data: WorkerWageSummary[] = response.data;
      setAllWorkersWages(data);

      // Calculate dashboard stats - use NET wages (total_billable_wages) for display
      const totalNetBillable = data.reduce((sum, w) => sum + w.total_billable_wages, 0);
      const totalNonBillable = data.reduce((sum, w) => sum + w.total_non_billable_wages, 0);
      const totalAlteredDeduction = data.reduce((sum, w) => sum + (w.altered_deduction || 0), 0);
      const totalRejectedDeduction = data.reduce((sum, w) => sum + (w.rejected_deduction || 0), 0);
      const topEarner = data.length > 0 ? data.reduce((max, w) =>
        w.total_billable_wages > max.total_billable_wages ? w : max
      , data[0]) : null;

      setDashboardStats({
        totalBillableWages: totalNetBillable,
        totalNonBillableWages: totalNonBillable,
        totalAlteredDeduction: totalAlteredDeduction,
        totalRejectedDeduction: totalRejectedDeduction,
        totalWorkers: data.length,
        topEarner,
      });
    } catch {
      showToast("error", "Failed to fetch wages data. Please try again.");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API, showToast]);

  // Fetch worker detailed logs
  const fetchWorkerDetails = useCallback(async (workerId: number) => {
    setDetailLoading(true);
    try {
      const params = new URLSearchParams();
      // Only send dates if they're valid Gregorian dates (not Nepali)
      if (startDate && !isNepaliDate(startDate)) params.append('start_date', startDate);
      if (endDate && !isNepaliDate(endDate)) params.append('end_date', endDate);

      const response = await axios.get(
        `${API}/wages/worker/${workerId}?${params.toString()}`
      );

      setWorkerDetailedLogs(response.data.detailed_logs || []);
    } catch {
      showToast("error", "Failed to fetch worker details.");
    } finally {
      setDetailLoading(false);
    }
  }, [API, startDate, endDate, showToast]);

  // Fetch payment summary for this month (dashboard)
  const fetchPaymentSummary = useCallback(async () => {
    try {
      // Get current month start/end
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

      const response = await axios.get(`${API}/payments/summary?start_date=${monthStart}&end_date=${monthEnd}`);
      setTotalPaidThisMonth(response.data.total_paid || 0);
    } catch {
      // Silent fail for payment summary
    }
  }, [API]);

  // Fetch worker payments
  const fetchWorkerPayments = useCallback(async (workerId: number) => {
    try {
      const response = await axios.get(`${API}/payments/worker/${workerId}`);
      setWorkerPayments(response.data.payments || []);
      setWorkerPaymentSummary(response.data.summary || null);
    } catch {
      // Silent fail for payments
    }
  }, [API]);

  // Fetch sub-batches a worker has worked on
  const fetchWorkerSubBatches = useCallback(async (workerId: number) => {
    try {
      const response = await axios.get(`${API}/payments/worker/${workerId}/sub-batches`);
      setWorkerSubBatches(response.data || []);
    } catch {
      // Silent fail
    }
  }, [API]);

  // Calculate wages for date range
  const calculateDateRangeWages = useCallback(async (workerId: number, start: string, end: string) => {
    try {
      const response = await axios.get(
        `${API}/payments/calculate/date-range?worker_id=${workerId}&start_date=${start}&end_date=${end}`
      );
      setCalculatedAmount(response.data.calculated_amount || 0);
    } catch {
      setCalculatedAmount(null);
    }
  }, [API]);

  // Calculate wages for sub-batch
  const calculateSubBatchWages = useCallback(async (workerId: number, subBatchId: number) => {
    try {
      const response = await axios.get(
        `${API}/payments/calculate/sub-batch?worker_id=${workerId}&sub_batch_id=${subBatchId}`
      );
      setCalculatedAmount(response.data.calculated_amount || 0);
    } catch {
      setCalculatedAmount(null);
    }
  }, [API]);

  // Record a payment
  const handleRecordPayment = async () => {
    if (!selectedWorkerForDetail) return;

    // Validate
    if (!paymentFormData.amount || parseFloat(paymentFormData.amount) <= 0) {
      showToast("warning", "Please enter a valid amount");
      return;
    }

    if (paymentFormData.payment_type === 'DATE_RANGE') {
      if (!paymentFormData.start_date || !paymentFormData.end_date) {
        showToast("warning", "Please select start and end dates");
        return;
      }
    }

    if (paymentFormData.payment_type === 'SUB_BATCH') {
      if (!paymentFormData.sub_batch_id) {
        showToast("warning", "Please select a sub-batch");
        return;
      }
    }

    // Validate payment doesn't exceed remaining balance
    const totalPaid = workerPaymentSummary?.total_paid || 0;
    const remainingBalance = selectedWorkerForDetail.total_billable_wages - totalPaid;
    const paymentAmount = parseFloat(paymentFormData.amount);

    if (paymentAmount > remainingBalance) {
      if (remainingBalance <= 0) {
        showToast("warning", "This worker has no remaining balance. All billable wages have been paid.");
      } else {
        showToast("warning", `Payment amount (Rs. ${paymentAmount.toLocaleString()}) exceeds remaining balance of Rs. ${remainingBalance.toLocaleString()}`);
      }
      return;
    }

    setPaymentLoading(true);
    try {
      await axios.post(`${API}/payments`, {
        worker_id: selectedWorkerForDetail.worker_id,
        amount: parseFloat(paymentFormData.amount),
        payment_type: paymentFormData.payment_type,
        payment_method: paymentFormData.payment_method,
        payment_date: paymentFormData.payment_date,
        reference_number: paymentFormData.reference_number || null,
        remarks: paymentFormData.remarks || null,
        start_date: paymentFormData.payment_type === 'DATE_RANGE' ? paymentFormData.start_date : null,
        end_date: paymentFormData.payment_type === 'DATE_RANGE' ? paymentFormData.end_date : null,
        sub_batch_id: paymentFormData.payment_type === 'SUB_BATCH' ? parseInt(paymentFormData.sub_batch_id) : null,
      });

      showToast("success", "Payment recorded successfully!");
      setShowPaymentModal(false);
      resetPaymentForm();
      fetchWorkerPayments(selectedWorkerForDetail.worker_id);
      fetchPaymentSummary();
    } catch (error: any) {
      showToast("error", error.response?.data?.error || "Failed to record payment");
    } finally {
      setPaymentLoading(false);
    }
  };

  // Open void modal
  const openVoidModal = (paymentId: number) => {
    setVoidPaymentId(paymentId);
    setVoidReason('');
    setShowVoidModal(true);
  };

  // Void a payment (instead of deleting)
  const handleVoidPayment = async () => {
    if (!voidPaymentId) return;

    if (!voidReason.trim()) {
      showToast("warning", "Please enter a reason for voiding this payment");
      return;
    }

    setVoidLoading(true);
    try {
      await axios.post(`${API}/payments/${voidPaymentId}/void`, {
        void_reason: voidReason.trim(),
      });
      showToast("success", "Payment voided successfully");
      setShowVoidModal(false);
      setVoidPaymentId(null);
      setVoidReason('');
      if (selectedWorkerForDetail) {
        fetchWorkerPayments(selectedWorkerForDetail.worker_id);
      }
      fetchPaymentSummary();
    } catch (error: any) {
      showToast("error", error.response?.data?.error || "Failed to void payment");
    } finally {
      setVoidLoading(false);
    }
  };

  // Reset payment form
  const resetPaymentForm = () => {
    setPaymentFormData({
      payment_type: 'DIRECT',
      payment_method: 'CASH',
      amount: '',
      payment_date: new Date().toISOString().split('T')[0],
      reference_number: '',
      remarks: '',
      start_date: '',
      end_date: '',
      sub_batch_id: '',
    });
    setCalculatedAmount(null);
  };

  // Open payment modal
  const openPaymentModal = () => {
    resetPaymentForm();
    if (selectedWorkerForDetail) {
      fetchWorkerSubBatches(selectedWorkerForDetail.worker_id);
    }
    setShowPaymentModal(true);
  };

  // Initial load - fetch departments, wages, and payment summary
  useEffect(() => {
    fetchDepartments();
    fetchAllWorkersWages('all', '', '');
    fetchPaymentSummary();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter, sort, and paginate data
  const { paginatedData, totalPages, totalFiltered } = useMemo(() => {
    // Step 1: Sort
    const sorted = [...allWorkersWages].sort((a, b) => {
      const aVal = a[sortColumn as keyof WorkerWageSummary];
      const bVal = b[sortColumn as keyof WorkerWageSummary];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return sortDirection === "asc" ? -1 : 1;
      if (bVal == null) return sortDirection === "asc" ? 1 : -1;
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDirection === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });

    // Step 2: Paginate
    const totalFiltered = sorted.length;
    const totalPages = Math.ceil(totalFiltered / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginated = sorted.slice(startIndex, startIndex + itemsPerPage);

    return { paginatedData: paginated, totalPages, totalFiltered };
  }, [allWorkersWages, sortColumn, sortDirection, currentPage, itemsPerPage]);

  // Handle sort column click
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
    setCurrentPage(1);
  };

  // Handle row click
  const handleRowClick = (worker: WorkerWageSummary) => {
    setSelectedWorkerForDetail(worker);
    setActiveView('detail');
    fetchWorkerDetails(worker.worker_id);
    fetchWorkerPayments(worker.worker_id);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedDepartment("all");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
    // Fetch with no filters
    fetchAllWorkersWages('all', '', '');
  };

  // Check if any filters are active
  const hasActiveFilters = selectedDepartment !== "all" || startDate !== "" || endDate !== "";

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Worker ID', 'Worker Name', 'Gross Wages', 'Altered Deduction', 'Altered Qty', 'Rejected Deduction', 'Rejected Qty', 'Total Deductions', 'Net Wages', 'Non-Billable Wages', 'Total Quantity', 'Billable Qty', 'Non-Billable Qty', 'Entries'];
    const csvContent = [
      headers.join(','),
      ...allWorkersWages.map(w => {
        const totalDeductions = (w.altered_deduction || 0) + (w.rejected_deduction || 0);
        return [
          w.worker_id,
          `"${w.worker_name}"`,
          (w.gross_billable_wages || 0).toFixed(2),
          (w.altered_deduction || 0).toFixed(2),
          w.altered_quantity || 0,
          (w.rejected_deduction || 0).toFixed(2),
          w.rejected_quantity || 0,
          totalDeductions.toFixed(2),
          w.total_billable_wages.toFixed(2),
          w.total_non_billable_wages.toFixed(2),
          w.total_quantity_worked,
          w.billable_quantity,
          w.non_billable_quantity,
          w.total_entries
        ].join(',');
      })
    ].join('\n');

    const fileSlug = deptLabel.toLowerCase().replace(/\s+/g, '_');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `wage_report_${fileSlug}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    showToast("success", `Wage report for ${deptLabel} exported successfully!`);
  };

  // Export payment history to CSV
  const exportPaymentHistoryCSV = () => {
    if (!selectedWorkerForDetail || workerPayments.length === 0) return;

    const workerName = selectedWorkerForDetail.worker_name;
    const summaryRows = [
      `Payment History Export`,
      `Worker:,${workerName}`,
      `Total Paid:,"Rs. ${(workerPaymentSummary?.total_paid || 0).toLocaleString()}"`,
      `Total Payments:,${workerPaymentSummary?.total_payments || 0}`,
      `Export Date:,${new Date().toLocaleDateString('en-US')}`,
      '',
    ];

    const headers = ['Payment Date', 'Type', 'Amount', 'Method', 'Reference', 'Remarks', 'Start Date', 'End Date', 'Sub-Batch'];
    const dataRows = workerPayments.map(payment => [
      payment.payment_date ? new Date(payment.payment_date).toLocaleDateString('en-US') : '-',
      payment.payment_type,
      payment.amount,
      payment.payment_method.replace('_', ' '),
      `"${payment.reference_number || '-'}"`,
      `"${payment.remarks || '-'}"`,
      payment.start_date ? new Date(payment.start_date).toLocaleDateString('en-US') : '-',
      payment.end_date ? new Date(payment.end_date).toLocaleDateString('en-US') : '-',
      `"${payment.sub_batch?.name || '-'}"`,
    ].join(','));

    const csvContent = [...summaryRows, headers.join(','), ...dataRows].join('\n');

    const fileSlug = workerName.toLowerCase().replace(/\s+/g, '_');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `payment_history_${fileSlug}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    showToast("success", `Payment history for ${workerName} exported successfully!`);
  };

  // Export individual worker detailed logs to CSV
  const exportWorkerCSV = () => {
    if (!selectedWorkerForDetail || workerDetailedLogs.length === 0) return;

    const workerName = selectedWorkerForDetail.worker_name;
    const totalDeductions = (selectedWorkerForDetail.altered_deduction || 0) + (selectedWorkerForDetail.rejected_deduction || 0);
    const summaryRows = [
      `Worker:,${workerName}`,
      `Gross Wages:,"Rs. ${(selectedWorkerForDetail.gross_billable_wages || 0).toLocaleString()}"`,
      `Altered Deduction:,"Rs. ${(selectedWorkerForDetail.altered_deduction || 0).toLocaleString()}",(${selectedWorkerForDetail.altered_quantity || 0} pcs)`,
      `Rejected Deduction:,"Rs. ${(selectedWorkerForDetail.rejected_deduction || 0).toLocaleString()}",(${selectedWorkerForDetail.rejected_quantity || 0} pcs)`,
      `Total Deductions:,"Rs. ${totalDeductions.toLocaleString()}"`,
      `Net Wages (Billable):,"Rs. ${selectedWorkerForDetail.total_billable_wages.toLocaleString()}"`,
      `Non-Billable Wages:,"Rs. ${selectedWorkerForDetail.total_non_billable_wages.toLocaleString()}"`,
      `Total Quantity:,${selectedWorkerForDetail.total_quantity_worked}`,
      `Total Entries:,${selectedWorkerForDetail.total_entries}`,
      '',
    ];

    const headers = ['Date', 'Sub-Batch', 'Activity', 'Particulars', 'Quantity', 'Unit Price', 'Amount', 'Billable Status'];
    const dataRows = workerDetailedLogs.map(log => [
      log.work_date ? new Date(log.work_date).toLocaleDateString('en-US') : '-',
      `"${log.sub_batch_name || '-'}"`,
      log.activity_type || 'NORMAL',
      `"${log.particulars || '-'}"`,
      log.quantity_worked,
      log.unit_price,
      log.amount,
      log.is_billable ? 'Billable' : 'Non-Billable',
    ].join(','));

    const csvContent = [...summaryRows, headers.join(','), ...dataRows].join('\n');

    const fileSlug = workerName.toLowerCase().replace(/\s+/g, '_');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `wage_detail_${fileSlug}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    showToast("success", `Wage details for ${workerName} exported successfully!`);
  };

  // Apply filters
  const handleApplyFilters = () => {
    setCurrentPage(1);
    fetchAllWorkersWages(selectedDepartment, startDate, endDate);
  };

  // Sort options
  const sortOptions: FilterOption[] = [
    { value: "total_billable_wages", label: "Net Wages (High to Low)", description: "Sort by net wages descending" },
    { value: "gross_billable_wages", label: "Gross Wages (High to Low)", description: "Sort by gross wages descending" },
    { value: "worker_name", label: "Worker Name (A-Z)", description: "Sort alphabetically by name" },
    { value: "total_quantity_worked", label: "Quantity Worked", description: "Sort by total quantity" },
    { value: "total_entries", label: "Number of Entries", description: "Sort by entry count" },
  ];

  // Department options
  const departmentOptions: FilterOption[] = [
    { value: "all", label: "All Departments", description: "Show all workers" },
    ...departments.map(d => ({ value: d.id.toString(), label: d.name }))
  ];

  // Derive department label from current filter
  const deptLabel = departmentOptions.find(d => d.value === selectedDepartment)?.label ?? "All Departments";

  return (
    <div className="p-6 bg-white min-h-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Wage Management</h1>
        <p className="text-sm text-gray-500">View and manage worker wages across all departments</p>
      </div>

      {/* Dashboard Summary Cards */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        {/* Total Billable Wages Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Billable Wages</p>
              <p className="text-xl font-bold text-gray-900">
                Rs. {dashboardStats.totalBillableWages.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        {/* Total Paid This Month Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Paid This Month</p>
              <p className="text-xl font-bold text-purple-600">
                Rs. {totalPaidThisMonth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        {/* Total Workers Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Workers</p>
              <p className="text-xl font-bold text-gray-900">
                {dashboardStats.totalWorkers}
              </p>
            </div>
          </div>
        </div>

        {/* Total Deductions Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Deductions</p>
              <p className="text-xl font-bold text-red-600">
                Rs. {(dashboardStats.totalAlteredDeduction + dashboardStats.totalRejectedDeduction).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-gray-400">
                Altered: Rs. {dashboardStats.totalAlteredDeduction.toLocaleString()} | Rejected: Rs. {dashboardStats.totalRejectedDeduction.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Top Earner Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Top Earner</p>
              <p className="text-lg font-bold text-gray-900 truncate max-w-[150px]">
                {dashboardStats.topEarner?.worker_name || '-'}
              </p>
              {dashboardStats.topEarner && (
                <p className="text-xs text-gray-500">
                  Rs. {dashboardStats.topEarner.total_billable_wages.toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex items-center gap-2 mb-4 border-b border-gray-200">
        <button
          onClick={() => { setActiveView('all'); setSelectedWorkerForDetail(null); }}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeView === 'all'
              ? 'text-[#2272B4] border-b-2 border-[#2272B4]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          All Workers
        </button>
        {selectedWorkerForDetail && (
          <button
            onClick={() => setActiveView('detail')}
            className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
              activeView === 'detail'
                ? 'text-[#2272B4] border-b-2 border-[#2272B4]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {selectedWorkerForDetail.worker_name}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedWorkerForDetail(null);
                setActiveView('all');
              }}
              className="p-0.5 hover:bg-gray-200 rounded"
            >
              <X className="w-3 h-3" />
            </button>
          </button>
        )}

      </div>

      {activeView === 'all' ? (
        <>
          {/* HubSpot-style Filter Bar */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <FilterDropdown
              label="All Departments"
              options={departmentOptions}
              value={selectedDepartment}
              onChange={(val) => { setSelectedDepartment(val); setCurrentPage(1); fetchAllWorkersWages(val, startDate, endDate); }}
            />

            {/* Date Range - HubSpot style compact */}
            <div className="flex items-center gap-2">
              <NepaliDatePicker
                value={startDate}
                onChange={(value) => setStartDate(value)}
                placeholder="Start"
                className="w-[120px]"
              />
              <span className="text-gray-400 text-sm">to</span>
              <NepaliDatePicker
                value={endDate}
                onChange={(value) => setEndDate(value)}
                placeholder="End"
                className="w-[120px]"
              />
            </div>

            <button
              onClick={handleApplyFilters}
              className="px-4 py-2 text-sm bg-[#2272B4] text-white rounded-md hover:bg-[#1b5a8a] transition-colors"
            >
              Apply
            </button>

            <FilterDropdown
              label="Sort By"
              icon={<ArrowUpDown className="w-4 h-4" />}
              options={sortOptions}
              value={sortColumn}
              onChange={(val) => { setSortColumn(val); setSortDirection("desc"); setCurrentPage(1); }}
              searchable={false}
            />

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Clear all
              </button>
            )}

            {/* Export Button */}
            <button
              onClick={exportToCSV}
              disabled={loading || allWorkersWages.length === 0}
              className="ml-auto flex items-center gap-2 px-4 py-2 text-sm bg-[#2272B4] text-white rounded-md hover:bg-[#1b5a8a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              Export CSV ({deptLabel})
            </button>

            <span className="text-sm text-gray-500">{totalFiltered} workers</span>
          </div>

          {/* Data Table */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    onClick={() => handleSort('worker_name')}
                    className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-1">
                      Worker Name
                      {sortColumn === 'worker_name' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('gross_billable_wages')}
                    className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center justify-end gap-1">
                      Gross Wages
                      {sortColumn === 'gross_billable_wages' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                  <th
                    className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    <div className="flex items-center justify-end gap-1">
                      Deductions
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('total_billable_wages')}
                    className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center justify-end gap-1">
                      Net Wages
                      {sortColumn === 'total_billable_wages' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('total_quantity_worked')}
                    className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center justify-end gap-1">
                      Qty Worked
                      {sortColumn === 'total_quantity_worked' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('total_entries')}
                    className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center justify-end gap-1">
                      Entries
                      {sortColumn === 'total_entries' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12">
                      <Loader />
                    </td>
                  </tr>
                ) : paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      No wage data available. Try adjusting filters or date range.
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((worker) => {
                    const totalDeductions = (worker.altered_deduction || 0) + (worker.rejected_deduction || 0);
                    const hasDeductions = totalDeductions > 0;
                    return (
                      <tr
                        key={worker.worker_id}
                        onClick={() => handleRowClick(worker)}
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-2 text-sm font-medium text-gray-900">
                          {worker.worker_name}
                        </td>
                        <td className="px-4 py-2 text-sm text-right text-gray-600">
                          Rs. {(worker.gross_billable_wages || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-2 text-sm text-right">
                          {hasDeductions ? (
                            <span className="text-red-600 font-medium" title={`Altered: Rs. ${(worker.altered_deduction || 0).toLocaleString()} | Rejected: Rs. ${(worker.rejected_deduction || 0).toLocaleString()}`}>
                              -Rs. {totalDeductions.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-sm text-right text-green-600 font-medium">
                          Rs. {worker.total_billable_wages.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-2 text-sm text-right text-gray-900">
                          {worker.total_quantity_worked.toLocaleString()}
                        </td>
                        <td className="px-4 py-2 text-sm text-right text-gray-500">
                          {worker.total_entries}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && paginatedData.length > 0 && (
            <div className="flex items-center justify-between mt-4 px-2">
              <span className="text-sm text-gray-500">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalFiltered)} of {totalFiltered}
              </span>

              <div className="flex items-center gap-4">
                {/* Items per page selector */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">per page</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                    className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2272B4]"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>

                {/* Page navigation */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronsLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="px-3 py-1 text-sm text-gray-700">
                    Page {currentPage} of {totalPages || 1}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronsRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Worker Detail View */
        <div>
          {/* Back button and worker info header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => { setActiveView('all'); }}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to all workers
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={openPaymentModal}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  <CreditCard className="w-4 h-4" />
                  Record Payment
                </button>
                <button
                  onClick={exportWorkerCSV}
                  disabled={detailLoading || workerDetailedLogs.length === 0}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-[#2272B4] text-white rounded-md hover:bg-[#1b5a8a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
              </div>
            </div>

            {selectedWorkerForDetail && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  {selectedWorkerForDetail.worker_name}
                </h2>
                {/* First row: Gross, Deductions, Net Wages */}
                <div className="grid grid-cols-4 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Gross Wages</p>
                    <p className="text-lg font-bold text-gray-700">
                      Rs. {(selectedWorkerForDetail.gross_billable_wages || 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Deductions</p>
                    <p className="text-lg font-bold text-red-600">
                      -Rs. {((selectedWorkerForDetail.altered_deduction || 0) + (selectedWorkerForDetail.rejected_deduction || 0)).toLocaleString()}
                    </p>
                    {((selectedWorkerForDetail.altered_deduction || 0) > 0 || (selectedWorkerForDetail.rejected_deduction || 0) > 0) && (
                      <p className="text-xs text-gray-400">
                        Altered: {selectedWorkerForDetail.altered_quantity || 0} pcs | Rejected: {selectedWorkerForDetail.rejected_quantity || 0} pcs
                      </p>
                    )}
                  </div>
                  <div className="border-l-2 border-green-200 pl-4">
                    <p className="text-xs text-gray-500 uppercase">Net Wages</p>
                    <p className="text-lg font-bold text-green-600">
                      Rs. {selectedWorkerForDetail.total_billable_wages.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Total Entries</p>
                    <p className="text-lg font-bold text-gray-900">
                      {selectedWorkerForDetail.total_entries}
                    </p>
                  </div>
                </div>
                {/* Second row: Payment info */}
                <div className="grid grid-cols-4 gap-4 pt-3 border-t border-gray-200">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Total Paid</p>
                    <p className="text-lg font-bold text-purple-600">
                      Rs. {(workerPaymentSummary?.total_paid || 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Balance Due</p>
                    <p className={`text-lg font-bold ${
                      (selectedWorkerForDetail.total_billable_wages - (workerPaymentSummary?.total_paid || 0)) > 0
                        ? 'text-amber-600'
                        : 'text-gray-600'
                    }`}>
                      Rs. {(selectedWorkerForDetail.total_billable_wages - (workerPaymentSummary?.total_paid || 0)).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Non-Billable</p>
                    <p className="text-lg font-bold text-gray-500">
                      Rs. {selectedWorkerForDetail.total_non_billable_wages.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Qty Worked</p>
                    <p className="text-lg font-bold text-gray-900">
                      {selectedWorkerForDetail.total_quantity_worked.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Detailed Logs Table */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900">Work Log Details</h3>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sub-Batch</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Particulars</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {detailLoading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12">
                      <Loader />
                    </td>
                  </tr>
                ) : workerDetailedLogs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      No work logs found for this worker in the selected date range.
                    </td>
                  </tr>
                ) : (
                  workerDetailedLogs.map((log) => (
                    <tr
                      key={log.id}
                      className={`${!log.is_billable ? 'bg-gray-50' : ''} hover:bg-gray-100`}
                    >
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {log.work_date ? new Date(log.work_date).toLocaleDateString('en-US') : '-'}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">{log.sub_batch_name || '-'}</td>
                      <td className="px-4 py-2 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          log.activity_type === 'NORMAL' ? 'bg-blue-100 text-blue-800' :
                          log.activity_type === 'ALTERED' ? 'bg-amber-100 text-amber-800' :
                          log.activity_type === 'REJECTED' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {log.activity_type || 'NORMAL'}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-600">{log.particulars || '-'}</td>
                      <td className="px-4 py-2 text-sm text-right text-gray-900">{log.quantity_worked}</td>
                      <td className="px-4 py-2 text-sm text-right text-gray-900">Rs. {log.unit_price}</td>
                      <td className="px-4 py-2 text-sm text-right font-medium text-gray-900">
                        Rs. {log.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          log.is_billable
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {log.is_billable ? 'Billable' : 'Non-Billable'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Payment History Table */}
          <div className="border border-gray-200 rounded-lg overflow-hidden mt-6">
            <div className="bg-purple-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-purple-600" />
                Payment History
              </h3>
              <div className="flex items-center gap-3">
                {workerPaymentSummary && (
                  <span className="text-sm text-purple-600 font-medium">
                    {workerPaymentSummary.total_payments} payment(s) | Total: Rs. {workerPaymentSummary.total_paid.toLocaleString()}
                  </span>
                )}
                <button
                  onClick={exportPaymentHistoryCSV}
                  disabled={workerPayments.length === 0}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Export payment history to CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export CSV
                </button>
              </div>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {workerPayments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      No payments recorded yet. Click &quot;Record Payment&quot; to add one.
                    </td>
                  </tr>
                ) : (
                  workerPayments.map((payment) => (
                    <tr
                      key={payment.id}
                      className={`${payment.is_voided ? 'bg-red-50 opacity-60' : 'hover:bg-gray-50'}`}
                    >
                      <td className={`px-4 py-2 text-sm ${payment.is_voided ? 'text-gray-400' : 'text-gray-900'}`}>
                        {new Date(payment.payment_date).toLocaleDateString('en-US')}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          payment.is_voided ? 'bg-gray-100 text-gray-500' :
                          payment.payment_type === 'DATE_RANGE' ? 'bg-blue-100 text-blue-800' :
                          payment.payment_type === 'SUB_BATCH' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {payment.payment_type === 'DATE_RANGE'
                            ? `Date Range (${payment.start_date ? new Date(payment.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''} - ${payment.end_date ? new Date(payment.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''})`
                            : payment.payment_type === 'SUB_BATCH'
                            ? `Sub-Batch: ${payment.sub_batch?.name || payment.sub_batch_id}`
                            : 'Direct'}
                        </span>
                      </td>
                      <td className={`px-4 py-2 text-sm text-right font-medium ${payment.is_voided ? 'text-gray-400 line-through' : 'text-purple-600'}`}>
                        Rs. {payment.amount.toLocaleString()}
                      </td>
                      <td className={`px-4 py-2 text-sm ${payment.is_voided ? 'text-gray-400' : 'text-gray-900'}`}>
                        {payment.payment_method.replace('_', ' ')}
                      </td>
                      <td className={`px-4 py-2 text-sm ${payment.is_voided ? 'text-gray-400' : 'text-gray-600'}`}>
                        {payment.reference_number || '-'}
                      </td>
                      <td className="px-4 py-2 text-center">
                        {payment.is_voided ? (
                          <div>
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              VOIDED
                            </span>
                            {payment.void_reason && (
                              <p className="text-xs text-gray-500 mt-1 max-w-[120px] truncate" title={payment.void_reason}>
                                {payment.void_reason}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-center">
                        {!payment.is_voided && (
                          <button
                            onClick={() => openVoidModal(payment.id)}
                            className="p-1 text-amber-500 hover:text-amber-700 hover:bg-amber-50 rounded"
                            title="Void payment"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Payment Drawer */}
      {showPaymentModal && selectedWorkerForDetail && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/20 transition-opacity duration-300"
            style={{ backdropFilter: 'blur(4px)' }}
            onClick={() => setShowPaymentModal(false)}
          />

          {/* Drawer */}
          <div className="ml-auto w-full max-w-xl bg-white shadow-lg p-4 relative h-screen overflow-y-auto">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
              onClick={() => setShowPaymentModal(false)}
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div className="border-b border-gray-200 pb-3 mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex gap-2 items-center">
                <CreditCard size={20} className="text-purple-600" />
                Record Payment
              </h3>
            </div>

            {/* Worker Info Card */}
            <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-100">
              <p className="text-sm text-gray-600">Worker: <span className="font-semibold text-gray-900">{selectedWorkerForDetail.worker_name}</span></p>
              <p className="text-sm text-gray-600">
                Gross Wages: <span className="font-semibold text-gray-700">Rs. {(selectedWorkerForDetail.gross_billable_wages || 0).toLocaleString()}</span>
                {((selectedWorkerForDetail.altered_deduction || 0) + (selectedWorkerForDetail.rejected_deduction || 0)) > 0 && (
                  <span className="text-red-500 ml-2">
                    - Rs. {((selectedWorkerForDetail.altered_deduction || 0) + (selectedWorkerForDetail.rejected_deduction || 0)).toLocaleString()} deductions
                  </span>
                )}
              </p>
              <p className="text-sm text-gray-600">Net Wages: <span className="font-semibold text-green-600">Rs. {selectedWorkerForDetail.total_billable_wages.toLocaleString()}</span></p>
              <p className="text-sm text-gray-600">Total Paid: <span className="font-semibold text-purple-600">Rs. {(workerPaymentSummary?.total_paid || 0).toLocaleString()}</span></p>
              <p className="text-sm text-gray-600">
                Balance Due: <span className={`font-semibold ${
                  (selectedWorkerForDetail.total_billable_wages - (workerPaymentSummary?.total_paid || 0)) > 0
                    ? 'text-amber-600'
                    : 'text-gray-500'
                }`}>
                  Rs. {(selectedWorkerForDetail.total_billable_wages - (workerPaymentSummary?.total_paid || 0)).toLocaleString()}
                </span>
                {(selectedWorkerForDetail.total_billable_wages - (workerPaymentSummary?.total_paid || 0)) <= 0 && (
                  <span className="ml-2 text-xs text-green-600 font-medium">(Fully Paid)</span>
                )}
              </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-3">
              {/* Payment Type */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1.5">
                  Payment Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={paymentFormData.payment_type}
                  onChange={(e) => {
                    const newType = e.target.value as 'DATE_RANGE' | 'SUB_BATCH' | 'DIRECT';
                    setPaymentFormData({ ...paymentFormData, payment_type: newType, amount: '' });
                    setCalculatedAmount(null);
                  }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="DIRECT">Direct Payment (Advance, Bonus, Ad-hoc)</option>
                  <option value="DATE_RANGE">By Date Range</option>
                  <option value="SUB_BATCH">By Sub-Batch</option>
                </select>
              </div>

              {/* DATE_RANGE specific fields */}
              {paymentFormData.payment_type === 'DATE_RANGE' && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1.5">Start Date</label>
                      <input
                        type="date"
                        value={paymentFormData.start_date}
                        onChange={(e) => {
                          setPaymentFormData({ ...paymentFormData, start_date: e.target.value });
                          if (e.target.value && paymentFormData.end_date && selectedWorkerForDetail) {
                            calculateDateRangeWages(selectedWorkerForDetail.worker_id, e.target.value, paymentFormData.end_date);
                          }
                        }}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1.5">End Date</label>
                      <input
                        type="date"
                        value={paymentFormData.end_date}
                        onChange={(e) => {
                          setPaymentFormData({ ...paymentFormData, end_date: e.target.value });
                          if (paymentFormData.start_date && e.target.value && selectedWorkerForDetail) {
                            calculateDateRangeWages(selectedWorkerForDetail.worker_id, paymentFormData.start_date, e.target.value);
                          }
                        }}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  {calculatedAmount !== null && (
                    <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-blue-200">
                      <span className="text-sm text-blue-700">
                        Calculated Wages: <span className="font-bold">Rs. {calculatedAmount.toLocaleString()}</span>
                      </span>
                      <button
                        onClick={() => setPaymentFormData({ ...paymentFormData, amount: calculatedAmount.toString() })}
                        className="text-xs text-blue-600 hover:text-blue-800 underline font-medium"
                      >
                        Use this amount
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* SUB_BATCH specific fields */}
              {paymentFormData.payment_type === 'SUB_BATCH' && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-100 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1.5">Sub-Batch</label>
                    <select
                      value={paymentFormData.sub_batch_id}
                      onChange={(e) => {
                        setPaymentFormData({ ...paymentFormData, sub_batch_id: e.target.value });
                        if (e.target.value && selectedWorkerForDetail) {
                          calculateSubBatchWages(selectedWorkerForDetail.worker_id, parseInt(e.target.value));
                        }
                      }}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select sub-batch...</option>
                      {workerSubBatches.map((sb) => (
                        <option key={sb.id} value={sb.id}>{sb.name}</option>
                      ))}
                    </select>
                  </div>
                  {calculatedAmount !== null && (
                    <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-green-200">
                      <span className="text-sm text-green-700">
                        Calculated Wages: <span className="font-bold">Rs. {calculatedAmount.toLocaleString()}</span>
                      </span>
                      <button
                        onClick={() => setPaymentFormData({ ...paymentFormData, amount: calculatedAmount.toString() })}
                        className="text-xs text-green-600 hover:text-green-800 underline font-medium"
                      >
                        Use this amount
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1.5">
                  Amount <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">Rs.</span>
                  <input
                    type="number"
                    value={paymentFormData.amount}
                    onChange={(e) => setPaymentFormData({ ...paymentFormData, amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full border border-gray-200 rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1.5">
                  Payment Method <span className="text-red-500">*</span>
                </label>
                <select
                  value={paymentFormData.payment_method}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, payment_method: e.target.value as 'CASH' | 'BANK_TRANSFER' | 'CHECK' | 'MOBILE_WALLET' })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="CASH">Cash</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="CHECK">Check</option>
                  <option value="MOBILE_WALLET">Mobile Wallet</option>
                </select>
              </div>

              {/* Payment Date */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1.5">
                  Payment Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={paymentFormData.payment_date}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, payment_date: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Reference Number */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1.5">
                  Reference # <span className="text-gray-400 text-xs font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={paymentFormData.reference_number}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, reference_number: e.target.value })}
                  placeholder="Transaction ID, check number, etc."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1.5">
                  Remarks <span className="text-gray-400 text-xs font-normal">(Optional)</span>
                </label>
                <textarea
                  value={paymentFormData.remarks}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, remarks: e.target.value })}
                  placeholder="Any notes about this payment..."
                  rows={2}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-200 sticky bottom-0 bg-white">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleRecordPayment}
                disabled={paymentLoading}
                className="px-6 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 font-medium transition-colors shadow-sm text-sm flex items-center gap-2"
              >
                {paymentLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Recording...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Record Payment
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Void Payment Modal */}
      {showVoidModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/30 transition-opacity duration-300"
            style={{ backdropFilter: 'blur(4px)' }}
            onClick={() => setShowVoidModal(false)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
              onClick={() => setShowVoidModal(false)}
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                  <X className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Void Payment</h3>
              </div>
              <p className="text-sm text-gray-600">
                This payment will be marked as voided and will not count towards the total paid.
                The record will be kept for audit purposes.
              </p>
            </div>

            {/* Warning Box */}
            <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-sm text-amber-800 font-medium">
                ⚠️ This action cannot be undone
              </p>
              <p className="text-xs text-amber-700 mt-1">
                Once voided, this payment cannot be restored. The record will remain visible but will be excluded from all calculations.
              </p>
            </div>

            {/* Void Reason Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-900 mb-1.5">
                Reason for Voiding <span className="text-red-500">*</span>
              </label>
              <textarea
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                placeholder="e.g., Duplicate payment, Wrong worker, Incorrect amount..."
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                autoFocus
              />
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowVoidModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleVoidPayment}
                disabled={voidLoading || !voidReason.trim()}
                className="px-4 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50 font-medium transition-colors shadow-sm text-sm flex items-center gap-2"
              >
                {voidLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Voiding...
                  </>
                ) : (
                  'Void Payment'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WageCalculation;
