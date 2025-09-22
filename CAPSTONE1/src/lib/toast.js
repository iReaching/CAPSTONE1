export function showToast(message, type = 'success') {
  try {
    const containerId = 'app-toast-container';
    let container = document.getElementById(containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = containerId;
      container.style.position = 'fixed';
      container.style.top = '16px';
      container.style.right = '16px';
      container.style.zIndex = '99999';
      container.style.display = 'flex';
      container.style.flexDirection = 'column';
      container.style.gap = '8px';
      document.body.appendChild(container);
    }

    const el = document.createElement('div');
    const bg = type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#16a34a';
    el.style.background = bg;
    el.style.color = '#fff';
    el.style.padding = '10px 14px';
    el.style.borderRadius = '10px';
    el.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)';
    el.style.fontSize = '14px';
    el.style.maxWidth = '360px';
    el.style.wordBreak = 'break-word';
    el.textContent = message;

    container.appendChild(el);
    setTimeout(() => {
      el.style.transition = 'opacity 250ms ease';
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 260);
    }, 3800);
  } catch (_) {
    // fallback
    alert(message);
  }
}
