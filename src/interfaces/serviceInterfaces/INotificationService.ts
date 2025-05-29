export interface INotificationService{
    sendNotification(token: string, title: string, body: string): Promise<void>
}