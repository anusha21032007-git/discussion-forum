export const timeAgo = (dateString) => {
  const now = new Date();
  const then = new Date(dateString);
  const diff = now - then; // milliseconds

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return `${seconds}s ago`;
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return `Yesterday`;
  return `${days}d ago`;
};