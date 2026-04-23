const STATUS_CONFIG = {
  online: { label: 'Online', color: 'bg-green-500' },
  away: { label: 'Away', color: 'bg-yellow-400' },
  out_of_office: { label: 'Out of Office', color: 'bg-orange-500' },
  offline: { label: 'Offline', color: 'bg-gray-400' },
};

export default function StatusBadge({ status = 'offline', showLabel = false }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.offline;
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`w-2.5 h-2.5 rounded-full ${cfg.color} shrink-0`} />
      {showLabel && <span className="text-xs text-gray-600">{cfg.label}</span>}
    </span>
  );
}
