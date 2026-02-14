import { binToUuid } from '../util/uuid';
import { notification_type as NotificationType } from '@prisma/client';

export interface DefaultNotificationInterface {
  userId: string;
  message: string;
  type: NotificationType;
}

export class ResponseFromNotification implements DefaultNotificationInterface {
  userId: string;
  message: string;
  type: NotificationType;
  notificationId: string;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: {
    user_id: Uint8Array<ArrayBufferLike>;
    message: string;
    type: NotificationType;
    notification_id: Uint8Array<ArrayBufferLike>;
    status: boolean;
    created_at: Date;
    updated_at: Date;
  }) {
    this.userId = binToUuid(data.user_id);
    this.message = data.message;
    this.type = data.type as NotificationType;
    this.notificationId = binToUuid(data.notification_id);
    this.status = data.status;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }
}
