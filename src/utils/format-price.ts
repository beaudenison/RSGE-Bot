const numberFormatter = new Intl.NumberFormat("en-US");

export function formatPrice(value: string | number): string {
  if (typeof value === "number") {
    return `${numberFormatter.format(value)} gp`;
  }

  if (!value) {
    return "Unknown";
  }

  const parsed = Number.parseFloat(value.toString().replace(/,/g, ""));
  if (!Number.isNaN(parsed) && /^-?\d+(\.\d+)?$/.test(value.toString())) {
    return `${numberFormatter.format(parsed)} gp`;
  }

  return `${value} gp`;
}

export function formatSignedChange(value: string | number): string {
  const raw = value.toString();
  if (raw === "0" || raw === "+0" || raw === "-0") {
    return "0";
  }

  if (raw.startsWith("+") || raw.startsWith("-")) {
    return raw;
  }

  return `+${raw}`;
}

export function formatRelativeTime(isoDate: string): string {
  const time = new Date(isoDate).getTime();
  if (Number.isNaN(time)) {
    return "Unknown";
  }

  const diffMs = Date.now() - time;
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) {
    return "just now";
  }
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}
