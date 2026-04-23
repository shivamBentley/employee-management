import { Link } from 'react-router-dom';
import { Info } from 'lucide-react';
import useAuthStore from '../../store/authStore';

/**
 * Informational banner shown when a feature is disabled.
 * Admins see a direct link to Settings; other users see a contact-admin message.
 *
 * @param {string} featureName - Human-readable name of the feature, e.g. "Leave Management"
 */
export default function FeatureDisabledBanner({ featureName }) {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  return (
    <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
      <Info size={18} className="shrink-0 mt-0.5 text-amber-500" />
      <p className="leading-relaxed">
        <span className="font-semibold">{featureName}</span> is currently disabled.{' '}
        {isAdmin ? (
          <>
            To use this feature, please enable it from{' '}
            <Link
              to="/settings"
              className="font-semibold underline underline-offset-2 hover:text-amber-900"
            >
              Settings
            </Link>
            .
          </>
        ) : (
          <>Please contact your administrator to enable this feature.</>
        )}
      </p>
    </div>
  );
}
