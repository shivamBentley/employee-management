import { useState, useEffect } from 'react';
import { applyLeave, getLeaveBalances, calculateDays } from '../api';
import { getLeaveTypes } from '../../leave-types/api';
import { useNavigate } from 'react-router-dom';
import { useFeatureFlag } from '../../../shared/hooks/useFeatureFlag';
import FeatureDisabledBanner from '../../../shared/components/FeatureDisabledBanner';
import useToastStore from '../../../store/toastStore';

export default function ApplyLeavePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ leave_type_id: '', start_date: '', end_date: '', reason: '' });
  const [loading, setLoading] = useState(false);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [balances, setBalances] = useState([]);
  const [preview, setPreview] = useState(null);
  const { enabled: featureEnabled } = useFeatureFlag('leave_management_enabled');
  const toast = useToastStore((s) => s.toast);

  useEffect(() => {
    Promise.all([
      getLeaveTypes(),
      getLeaveBalances({ year: new Date().getFullYear() }),
    ]).then(([tRes, bRes]) => {
      setLeaveTypes((tRes.data.leave_types ?? []).filter((t) => t.is_active));
      setBalances(bRes.data.balances ?? []);
    }).catch(() => {});
  }, []);

  // Calculate effective days when dates + type change
  useEffect(() => {
    if (!form.leave_type_id || !form.start_date || !form.end_date) {
      setPreview(null);
      return;
    }
    if (form.end_date < form.start_date) {
      setPreview(null);
      return;
    }
    calculateDays({ start_date: form.start_date, end_date: form.end_date })
      .then(({ data }) => setPreview(data))
      .catch(() => setPreview(null));
  }, [form.start_date, form.end_date, form.leave_type_id]);

  const selectedBalance = balances.find((b) => b.leave_type_id === Number(form.leave_type_id));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await applyLeave({ ...form, type: leaveTypes.find((t) => t.id === Number(form.leave_type_id))?.slug || 'other' });
      toast('Leave request submitted successfully', 'success');
      navigate('/leaves');
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to apply leave', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">

      {!featureEnabled && (
        <div className="mb-4">
          <FeatureDisabledBanner featureName="Leave Management" />
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Leave Type</label>
          <select
            required
            value={form.leave_type_id}
            onChange={(e) => setForm((f) => ({ ...f, leave_type_id: e.target.value }))}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none"
          >
            <option value="">Select leave type</option>
            {leaveTypes.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          {selectedBalance && (
            <p className="text-xs text-gray-500 mt-1">
              Available: <span className="font-semibold text-indigo-600">{selectedBalance.available}</span> hours
              (Allocated: {selectedBalance.allocated}, Used: {selectedBalance.used})
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
            <input
              type="date"
              required
              value={form.start_date}
              onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">End Date</label>
            <input
              type="date"
              required
              value={form.end_date}
              onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none"
            />
          </div>
        </div>

        {preview && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-lg px-4 py-3 text-sm">
            <p className="font-medium text-indigo-800">
              Effective hours: <span className="text-lg">{preview.effective_hours}</span>
            </p>
            <p className="text-xs text-indigo-600 mt-0.5">
              {preview.effective_days} working day(s) × 8h, excluding {preview.weekend_days ?? 0} weekend(s) and {preview.holiday_days ?? 0} holiday(s)
            </p>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Reason</label>
          <textarea
            value={form.reason}
            onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
            rows={3}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? 'Submitting…' : 'Submit Leave Request'}
        </button>
      </form>
    </div>
  );
}
