import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface Department {
  id: number;
  name: string;
}

interface AddWorkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddWorkerModal: React.FC<AddWorkerModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    pan: '',
    address: '',
    department_id: '',
    wage_type: 'hourly',
    wage_rate: '',
  });

  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load departments when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchDepartments();
    }
  }, [isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: '',
        pan: '',
        address: '',
        department_id: '',
        wage_type: 'hourly',
        wage_rate: '',
      });
    }
  }, [isOpen]);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/departments`);
      if (res.ok) {
        const data = await res.json();
        setDepartments(data);
      } else {
        alert('Failed to fetch departments');
      }
    } catch (e) {
      console.error(e);
      alert('Error fetching departments');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name || !formData.pan || !formData.address || !formData.wage_rate) {
      alert('Please fill in all required fields (Name, PAN, Address, Wage Rate)');
      return;
    }

    const wageRate = parseFloat(formData.wage_rate);
    if (isNaN(wageRate) || wageRate <= 0) {
      alert('Please enter a valid wage rate');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        pan: formData.pan,
        address: formData.address,
        department_id: formData.department_id ? parseInt(formData.department_id) : null,
        wage_type: formData.wage_type,
        wage_rate: wageRate,
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/workers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Worker "${result.name}" added successfully!`);
        onSuccess();
        onClose();
      } else {
        const err = await response.json().catch(() => ({}));
        alert(`Failed to add worker: ${err.message || 'Unknown error'}`);
      }
    } catch (e) {
      console.error(e);
      alert('Error adding worker');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="bg-white rounded-lg w-full max-w-md mx-4 relative shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-gray-50 border-b">
          <h3 className="text-lg font-semibold">Add New Worker</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Worker Name */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Worker Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter worker name"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* PAN Number */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              PAN Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="pan"
              value={formData.pan}
              onChange={handleChange}
              placeholder="Enter PAN number"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Address <span className="text-red-500">*</span>
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter address"
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Department (Optional)
            </label>
            <select
              name="department_id"
              value={formData.department_id}
              onChange={handleChange}
              disabled={loading}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">{loading ? 'Loading...' : 'Select Department'}</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {/* Wage Type */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Wage Type <span className="text-red-500">*</span>
            </label>
            <select
              name="wage_type"
              value={formData.wage_type}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="piece">Piece Rate</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          {/* Wage Rate */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Wage Rate <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="wage_rate"
              value={formData.wage_rate}
              onChange={handleChange}
              placeholder="Enter wage rate"
              step="0.01"
              min="0"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Adding...' : 'Add Worker'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddWorkerModal;
