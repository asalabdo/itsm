import React, { useState, useEffect } from 'react';
import { manageEngineAPI } from '../../../services/api';

const ManageEngineIntegration = ({ onSyncComplete }) => {
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, success, error
  const [connectionStatus, setConnectionStatus] = useState('unknown'); // unknown, connected, failed
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [syncResults, setSyncResults] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      setConnectionStatus('testing');
      const response = await manageEngineAPI.testConnection();
      setConnectionStatus(response.data.status === 'connected' ? 'connected' : 'failed');
    } catch (err) {
      setConnectionStatus('failed');
      setError('Failed to test ManageEngine connection');
    }
  };

  const handleSync = async () => {
    try {
      setSyncStatus('syncing');
      setError(null);
      const response = await manageEngineAPI.syncIncidents();
      setSyncResults(response.data);
      setLastSyncTime(new Date());
      setSyncStatus('success');
      if (onSyncComplete) {
        onSyncComplete();
      }
    } catch (err) {
      setSyncStatus('error');
      setError(err.response?.data?.error || 'Sync failed');
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'testing': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSyncStatusColor = () => {
    switch (syncStatus) {
      case 'syncing': return 'text-blue-600 bg-blue-100';
      case 'success': return 'text-green-600 bg-green-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          ManageEngine Integration
        </h3>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getConnectionStatusColor()}`}>
            {connectionStatus === 'connected' && '✓ Connected'}
            {connectionStatus === 'failed' && '✗ Disconnected'}
            {connectionStatus === 'testing' && '⟳ Testing...'}
            {connectionStatus === 'unknown' && '? Unknown'}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Connection Test */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Connection Status</span>
          <button
            onClick={testConnection}
            disabled={connectionStatus === 'testing'}
            className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md disabled:opacity-50"
          >
            Test Connection
          </button>
        </div>

        {/* Sync Controls */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">Incident Synchronization</span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSyncStatusColor()}`}>
              {syncStatus === 'idle' && 'Ready'}
              {syncStatus === 'syncing' && '⟳ Syncing...'}
              {syncStatus === 'success' && '✓ Synced'}
              {syncStatus === 'error' && '✗ Failed'}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleSync}
              disabled={syncStatus === 'syncing' || connectionStatus !== 'connected'}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {syncStatus === 'syncing' ? 'Syncing...' : 'Sync Incidents'}
            </button>

            {lastSyncTime && (
              <span className="text-xs text-gray-500">
                Last sync: {lastSyncTime.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Sync Results */}
        {syncResults && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Sync Results</h4>
            <div className="bg-gray-50 rounded-md p-3">
              <p className="text-sm text-gray-600">{syncResults.message}</p>
              {syncResults.syncedCount !== undefined && (
                <p className="text-xs text-gray-500 mt-1">
                  {syncResults.syncedCount} incidents synchronized
                </p>
              )}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="border-t pt-4">
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex">
                <div className="text-red-600 text-sm">
                  <strong>Error:</strong> {error}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Integration Info */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Integration Features</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Bidirectional incident synchronization</li>
            <li>• Real-time webhook updates from ManageEngine</li>
            <li>• Configurable field mapping</li>
            <li>• SLA status tracking and alerts</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ManageEngineIntegration;