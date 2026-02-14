import prisma from '../config/prisma';
import { DefaultNotificationInterface } from '../DTO/notification_dto';
import { uuidToBin } from '../util/uuid';

export class NotificationRepository {
  static async sendNotification(data: DefaultNotificationInterface) {
    const { userId, message, type } = data;

    const notification = await prisma.notification.create({
      data: {
        user_id: uuidToBin(userId),
        message,
        type,
        status: true,
      },
    });

    return notification;
  }

  static async getNotification(userId: Uint8Array<ArrayBuffer>) {
    const notification = await prisma.notification.findMany({
      where: {
        user_id: userId,
        status: true,
      },
    });

    return notification;
  }

  static async verifyUserNotification(
    userId: Uint8Array<ArrayBuffer>,
    notificationId: Uint8Array<ArrayBuffer>,
  ) {
    const isExist = await prisma.notification.count({
      where: {
        user_id: userId,
        notification_id: notificationId,
        status: true,
      },
    });

    if (isExist) {
      return true;
    }

    return false;
  }

  static async deleteNotification(
    userId: Uint8Array<ArrayBuffer>,
    notificationId: Uint8Array<ArrayBuffer>,
  ) {
    const result = await prisma.notification.update({
      data: {
        status: false,
      },
      where: {
        notification_id: notificationId,
        user_id: userId,
      },
    });

    return result;
  }

  static async deleteAllNotification(userId: Uint8Array<ArrayBuffer>) {
    const result = await prisma.notification.updateMany({
      data: {
        status: false,
      },
      where: {
        user_id: userId,
        status: true,
      },
    });

    return result.count;
  }
}
