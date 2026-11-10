// Placeholder cho slot locking mechanism nếu cần
export class SlotLockService {
  private static locks: Map<string, { userId: string; expiresAt: number }> = new Map();

  static lockSlot(timeslotId: string, userId: string, durationMs = 10 * 60 * 1000): boolean {
    const existing = this.locks.get(timeslotId);
    if (existing && existing.expiresAt > Date.now() && existing.userId !== userId) {
      return false; // Slot đang bị lock bởi user khác
    }
    this.locks.set(timeslotId, { userId, expiresAt: Date.now() + durationMs });
    return true;
  }

  static unlockSlot(timeslotId: string): void {
    this.locks.delete(timeslotId);
  }

  static isLocked(timeslotId: string, userId: string): boolean {
    const existing = this.locks.get(timeslotId);
    if (!existing || existing.expiresAt <= Date.now()) return false;
    return existing.userId !== userId;
  }
}
