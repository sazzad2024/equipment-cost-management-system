import { Component, Input } from '@angular/core';
import { NotificationService } from '../_services/notification.service';
import { animate, state, style, transition, trigger } from '@angular/animations';

export interface Notification {
  message: string;
  type: 'success' | 'error' | 'info';
}

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
  animations: [
    trigger('slideInOut', [
      state('in', style({ transform: 'translateX(-50%) translateY(0%)' })),
      transition(':enter', [
        style({ transform: 'translateX(-50%) translateY(100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateX(-50%) translateY(0%)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateX(-50%) translateY(100%)', opacity: 0 }))
      ])
    ])
  ]
})
export class NotificationComponent {
  notification: Notification | null = null;

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.notificationService.notification$.subscribe((notification) => {
      this.notification = notification;
    });
  }

  closeNotification() {
    this.notification = null;
  }
}
