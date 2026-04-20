export function openAuthModal(afterAuthEvent?: string): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('mango-modal-open-auth', { detail: { afterAuthEvent } }));
}

export function openSubscriptionModal(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event('mango-modal-open-subscription'));
}

export function openCoinStoreModal(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event('mango-modal-open-coins'));
}

export function closeAllModals(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event('mango-modal-close-all'));
}
