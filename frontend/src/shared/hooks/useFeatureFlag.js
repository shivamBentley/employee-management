import { useEffect } from 'react';
import useSettingsStore from '../../store/settingsStore';

/**
 * Returns whether a feature flag is enabled.
 * @param {string} key  - settings key, e.g. 'leave_management_enabled'
 * @returns {{ enabled: boolean, loading: boolean }}
 */
export function useFeatureFlag(key) {
  const { settings, loading, loaded, fetchSettings } = useSettingsStore();

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // While loading, assume enabled so pages don't flash the banner unnecessarily
  if (!loaded) return { enabled: true, loading: true };
  return { enabled: settings?.[key] === '1', loading: false };
}
