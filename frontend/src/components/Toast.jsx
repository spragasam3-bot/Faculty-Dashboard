import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose, duration = 3500 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className={`toast-banner toast-${type}`} role="status">
      {type === 'success' ? (
        <CheckCircle2 size={18} color="#22c55e" />
      ) : (
        <AlertCircle size={18} color="#ef4444" />
      )}
      <span>{message}</span>
      <button
        onClick={onClose}
        style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', marginLeft: '8px' }}
        aria-label="Dismiss message"
      >
        <X size={16} />
      </button>
    </div>
  );
}
