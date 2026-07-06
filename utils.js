/* ============================================================
   utils.js — shared helper functions
   ============================================================ */
'use strict';

/** Show a toast notification.
 * @param {string} message
 * @param {'info'|'success'|'error'|'warning'} type
 * @param {number} duration ms
 */
export function showToast(message, type = 'info', duration = 3500) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons = {
    success: '✓',
    error:   '✕',
    warning: '⚠',
    info:    'ℹ',
  };

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `<span>${icons[type] || ''}</span><span>${escHtml(message)}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideOut 0.25s ease forwards';
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
    // fallback removal
    setTimeout(() => toast.remove(), 500);
  }, duration);
}

/** HTML-escape a string. */
export function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Clamp a number between min and max. */
export function clamp(value, min, max) {
  return Math.min(Math.max(Number(value), min), max);
}

/** Round to n decimal places. */
export function round(value, n = 2) {
  return Math.round(Number(value) * 10 ** n) / 10 ** n;
}

/** Format a number with locale commas. */
export function fmt(value, decimals = 0) {
  const n = Number(value);
  if (isNaN(n)) return '—';
  return n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

/** Get a URL query parameter value. */
export function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

/** Debounce a function. */
export function debounce(fn, delay = 300) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
}
