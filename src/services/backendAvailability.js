const BACKEND_FLAG_KEY = 'itsm:backend-ready';

export const isBackendReady = () => localStorage.getItem(BACKEND_FLAG_KEY) === 'true';

export const markBackendReady = (value) => {
  localStorage.setItem(BACKEND_FLAG_KEY, value ? 'true' : 'false');
};

