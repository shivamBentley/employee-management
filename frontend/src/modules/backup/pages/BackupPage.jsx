import { useEffect, useRef, useState } from 'react';
import { getBackups, runBackup, downloadBackup, restoreBackup } from '../api';
import { Database, Download, RefreshCw, Upload, AlertTriangle, CheckCircle2, X } from 'lucide-react';
import useToastStore from '../../../store/toastStore';
import { useFeatureFlag } from '../../../shared/hooks/useFeatureFlag';
import FeatureDisabledBanner from '../../../shared/components/FeatureDisabledBanner';

export default function BackupPage() {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [restoreFile, setRestoreFile] = useState(null);
  const [restoring, setRestoring] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const fileInputRef = useRef(null);
  const toast = useToastStore((s) => s.toast);
  const { enabled: featureEnabled } = useFeatureFlag('backup_enabled');

  const load = () => {
    setLoading(true);
    getBackups()
      .then(({ data }) => setBackups(data.backups ?? []))
      .catch(() => toast('Failed to load backups', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleRun = async () => {
    setRunning(true);
    try {
      await runBackup();
      toast('Backup started — refreshing in 3s…', 'info');
      setTimeout(load, 3000);
    } catch {
      toast('Backup failed', 'error');
    } finally {
      setRunning(false);
    }
  };

  const handleDownload = async (filename) => {
    try {
      const { data } = await downloadBackup(filename);
      const url = URL.createObjectURL(new Blob([data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      toast(`Downloading ${filename}`, 'success');
    } catch {
      toast('Download failed', 'error');
    }
  };

  const fmt = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.zip')) {
      toast('Only .zip backup files are supported', 'error');
      return;
    }
    setRestoreFile(file);
    setConfirmOpen(true);
    e.target.value = '';
  };

  const handleRestore = async () => {
    if (!restoreFile) return;
    setConfirmOpen(false);
    setRestoring(true);
    try {
      await restoreBackup(restoreFile);
      toast('Database restored successfully', 'success');
      load();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Restore failed';
      toast(msg, 'error');
    } finally {
      setRestoring(false);
      setRestoreFile(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex items-center justify-end gap-2 flex-shrink-0">
        <button onClick={load} className="p-2 text-gray-500 rounded-lg hover:bg-gray-100" title="Refresh">
          <RefreshCw size={16} />
        </button>

        {/* Restore */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".zip"
          className="hidden"
          onChange={handleFileSelect}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={restoring}
          className="flex items-center gap-1.5 text-sm bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 disabled:opacity-60"
        >
          <Upload size={14} /> {restoring ? 'Restoring…' : 'Upload & Restore'}
        </button>

        {/* Create backup */}
        <button
          onClick={handleRun}
          disabled={running}
          className="flex items-center gap-1.5 text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60"
        >
          <Database size={14} /> {running ? 'Running…' : 'Run Backup'}
        </button>
      </div>

      {!featureEnabled && <FeatureDisabledBanner featureName="Backup & Restore" />}

      {/* Confirm Restore Dialog */}
      {confirmOpen && restoreFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2 text-amber-600">
                <AlertTriangle size={18} />
                <span className="font-semibold text-slate-800">Confirm Restore</span>
              </div>
              <button onClick={() => { setConfirmOpen(false); setRestoreFile(null); }} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                <X size={18} />
              </button>
            </div>
            <div className="px-5 py-5 space-y-3">
              <p className="text-sm text-slate-600">
                You are about to restore the database from:
              </p>
              <div className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 font-mono text-xs text-slate-700 break-all">
                {restoreFile.name} ({fmt(restoreFile.size)})
              </div>
              <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-red-50 border border-red-100 text-xs text-red-700">
                <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                <span>
                  <strong>This will overwrite all current data.</strong> Make sure you have a fresh backup before proceeding. This action cannot be undone.
                </span>
              </div>
            </div>
            <div className="flex justify-end gap-2 px-5 py-4 border-t border-slate-100 bg-slate-50">
              <button
                onClick={() => { setConfirmOpen(false); setRestoreFile(null); }}
                className="px-4 py-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRestore}
                className="flex items-center gap-1.5 px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                <CheckCircle2 size={14} /> Yes, Restore
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-gray-400 flex-shrink-0">Loading…</p>
      ) : (
        /* Scrollable table */
        <div className="flex-1 min-h-0 overflow-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full text-sm min-w-[480px]">
            <thead className="sticky top-0 z-10 bg-gray-50 text-gray-500 text-xs uppercase shadow-sm">
              <tr>
                {['Filename', 'Size', 'Created', 'Action'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {backups.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-gray-400">No backups yet</td>
                </tr>
              ) : (
                backups.map((b) => (
                  <tr key={b.filename} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{b.filename}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmt(b.size)}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{new Date(b.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDownload(b.filename)}
                        className="flex items-center gap-1 text-blue-600 hover:underline text-xs"
                      >
                        <Download size={12} /> Download
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

