export type NotificationType = 'success' | 'error' | 'info' | 'warning'

export abstract class NotificationService 
{
  abstract notify(type: NotificationType, message: string,): void;
}