import { useState } from 'react';
import { applyLeave } from '../api';
import { useNavigate } from 'react-router-dom';
import { useFeatureFlag } from '../../../shared/hooks/useFeatureFlag';
import FeatureDisabledBanner from '../../../shared/components/FeatureDisabledBanner';
import useToastStore from '../../../store/toastStore';

export default function ApplyLeavePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ type: 'casual', start_date: '', end_date: '', reason: '' });
  const [loading, setLoading] = useState(false);
  const { enabled: featureEnabled } = useFeatureFlag('leave_management_enabled');
  const toast = useToastStore((s) => s.toast);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await applyLeave(form);
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
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none"
          >
            {['casual', 'sick', 'annual', 'wfh'].map((t) => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
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
