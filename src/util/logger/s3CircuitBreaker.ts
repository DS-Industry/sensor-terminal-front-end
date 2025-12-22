export class S3CircuitBreaker {
  private failureCount: number = 0;
  private maxFailures: number = 5;
  private isOpen: boolean = false;
  private resetTime: number = 0;
  private cooldown: number = 300000;

  recordSuccess(): void {
    this.failureCount = 0;
    this.isOpen = false;
  }

  recordFailure(): boolean {
    this.failureCount++;
    if (this.failureCount >= this.maxFailures) {
      this.isOpen = true;
      this.resetTime = Date.now() + this.cooldown;
      return true;
    }
    return false;
  }

  canAttempt(): boolean {
    if (!this.isOpen) return true;
    
    if (Date.now() >= this.resetTime) {
      this.isOpen = false;
      this.failureCount = 0;
      return true;
    }
    
    return false;
  }

  getRemainingCooldown(): number {
    if (!this.isOpen) return 0;
    return Math.max(0, this.resetTime - Date.now());
  }
}

