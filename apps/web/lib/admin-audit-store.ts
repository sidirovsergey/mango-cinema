'use client';

export type AuditEntry = {
  id: string;
  actor: string;
  action: string;
  target: string;
  details?: Record<string, unknown>;
  timestamp: string;
};

const KEY = 'mango-admin-audit';
const EMAIL_KEY = 'mango-admin-email';
const MAX = 200;

function dispatch() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('mango-admin-audit-update'));
  }
}

function getActor(): string {
  if (typeof window === 'undefined') return 'admin@mango.ru';
  return localStorage.getItem(EMAIL_KEY) || 'admin@mango.ru';
}

export function logAudit(
  action: string,
  target: string,
  details?: Record<string, unknown>
): void {
  if (typeof window === 'undefined') return;
  const entry: AuditEntry = {
    id: 'audit_' + Math.random().toString(36).slice(2),
    actor: getActor(),
    action,
    target,
    details,
    timestamp: new Date().toISOString(),
  };
  const existing = getAuditLog();
  const updated = [entry, ...existing].slice(0, MAX);
  localStorage.setItem(KEY, JSON.stringify(updated));
  dispatch();
}

export function getAuditLog(): AuditEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AuditEntry[]) : [];
  } catch {
    return [];
  }
}

export function clearAuditLog(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEY);
  dispatch();
}
