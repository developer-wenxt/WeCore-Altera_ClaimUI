import { Injectable, signal } from '@angular/core';

export type MessageSeverity = 'success' | 'error';

@Injectable({ providedIn: 'root' })
export class GlobalMessageService {
  visible = signal(false);
  severity = signal<MessageSeverity>('success');
  summary = signal('');
  detail = signal('');

  show(severity: MessageSeverity, summary: string, detail: string): void {
    this.severity.set(severity);
    this.summary.set(summary);
    this.detail.set(detail);
    this.visible.set(true);
  }

  close(): void {
    this.visible.set(false);
  }
}