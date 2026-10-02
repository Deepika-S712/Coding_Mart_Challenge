import React from 'react';

export default function Badge({ status, label }) {
  const text = label || status || 'Active';
  const lower = String(text).toLowerCase();

  let badgeClass = 'badge-neutral';

  if (['active', 'completed', 'enrolled'].includes(lower)) {
    badgeClass = 'badge-success';
  } else if (['inactive', 'pending', 'undergraduate'].includes(lower)) {
    badgeClass = 'badge-info';
  } else if (['suspended', 'failed', 'dropped'].includes(lower)) {
    badgeClass = 'badge-error';
  } else if (['graduated', 'postgraduate'].includes(lower)) {
    badgeClass = 'badge-warning';
  }

  return <span className={`badge ${badgeClass}`}>{text}</span>;
}
