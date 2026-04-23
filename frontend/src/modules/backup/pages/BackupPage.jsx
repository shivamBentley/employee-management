import { useEffect, useState } from 'react';
import { getBackups, runBackup, downloadBackup } from '../api';
import { Database, Download, RefreshCw } from 'lucide-react';
import useToastStore from '../../../store/toastStore';
import { useFeatureFlag } from '../../../shared/hooks/useFeatureFlag';
import FeatureDisabledBanner from '../../../shared/components/FeatureDisabledBanner';

export default function BackupPage() {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-3 flex-shrink-0">
        <div className="flex gap-2">
          <button onClick={load} className="p-2 text-gray-500 rounded-lg hover:bg-gray-100" title="Refresh">
            <RefreshCw size={16} />
          </button>
          <button
            onClick={handleRun}
            disabled={running}
            className="flex items-center gap-1.5 text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60"
          >
            <Database size={14} /> {running ? 'Running…' : 'Run Backup'}
          </button>
        </div>
      </div>

      {!featureEnabled && <FeatureDisabledBanner featureName="Backup & Restore" />}

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

