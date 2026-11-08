import { formatDate } from "@/lib/format";

/** "Phạm Thị Lan" → "TL"; single word → first two letters. */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[parts.length - 2][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Avatar tones from the theme, picked by id so a user keeps the same colour. */
const AVATAR_TONES = [
  "bg-primary-fixed text-primary",
  "bg-pod-honey text-tertiary",
  "bg-secondary-container/70 text-on-secondary-container",
  "bg-pod-sky text-primary",
  "bg-pod-mint text-primary",
];

export function avatarTone(id: number): string {
  return AVATAR_TONES[id % AVATAR_TONES.length];
}

/** "Hôm nay" (< 1 day), "{d} ngày trước" (< 7 days), else dd/mm/yyyy. */
export function formatJoined(iso: string, now: Date = new Date()): string {
  const days = Math.floor((now.getTime() - new Date(iso).getTime()) / 86_400_000);
  if (days < 1) return "Hôm nay";
  if (days < 7) return `${days} ngày trước`;
  return formatDate(iso, false);
}

/** Why an active account cannot be locked from the UI, or null when it can. */
export function lockBlockedReason(user: { role: string }, isSelf: boolean): string | null {
  if (isSelf) return "Bạn không thể tự khóa tài khoản của mình";
  if (user.role === "admin") return "Không thể khóa tài khoản quản trị";
  return null;
}
