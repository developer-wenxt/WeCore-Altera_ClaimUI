import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Toast } from 'primeng/toast';
import { LoadingComponent } from './core/components/loading/loading.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Toast, LoadingComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Altra-Cliam');
}
