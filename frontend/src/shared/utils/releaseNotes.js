const STORAGE_KEY = 'ems_seen_release';
export const LATEST_VERSION = '1.1.0';

export function hasUnseenRelease() {
  return localStorage.getItem(STORAGE_KEY) !== LATEST_VERSION;
}

export function markReleaseSeen() {
  localStorage.setItem(STORAGE_KEY, LATEST_VERSION);
}
