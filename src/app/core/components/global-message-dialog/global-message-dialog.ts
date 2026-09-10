import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Dialog } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { GlobalMessageService } from '../../services/GlobalMessageService';

@Component({
  selector: 'app-global-message-dialog',
  standalone: true,
  imports: [CommonModule, Dialog, ButtonModule],
  templateUrl: './global-message-dialog.html',
  styleUrls: ['./global-message-dialog.scss']
})
export class GlobalMessageDialog {
  messageService = inject(GlobalMessageService);

  onVisibleChange(val: boolean): void {
    if (!val) this.messageService.close();
  }
}