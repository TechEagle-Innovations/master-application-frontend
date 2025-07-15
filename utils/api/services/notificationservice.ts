import { BaseService } from './BaseService';


export class NotificationService extends BaseService{

  private static instance: NotificationService;

  private constructor() {
      super('notification');
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async registerToken(token: string) {
    return this.post('register-token', { pushToken: token });
  }

  async removeToken(token: string) {
    return this.post('remove-token', { pushToken: token });
  }
} 

export const notificationService = NotificationService.getInstance();