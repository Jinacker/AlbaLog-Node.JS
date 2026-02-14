import { NotificationNotFoundError } from '../DTO/error_dto';
import { DefaultNotificationInterface, ResponseFromNotification } from '../DTO/notification_dto';
import { NotificationRepository } from '../repository/notification_repository';
import { binToUuid, uuidToBin } from '../util/uuid';

export class NotificationService {
  static async sendNotificationService(data: DefaultNotificationInterface) {
    const result = await NotificationRepository.sendNotification(data);

    return new ResponseFromNotification(result);
  }

  static async getNotificationService(userId: string) {
    const parsedId = uuidToBin(userId);

    const notification = await NotificationRepository.getNotification(parsedId);

    if (notification.length === 0) {
      throw new NotificationNotFoundError('알림이 존재하지 않습니다.', { userId });
    }

    const result = notification.map((item) => new ResponseFromNotification(item));

    return result;
  }

  static async deleteNotificationService(userId: string, notificationId: string) {
    const parsedId = uuidToBin(userId);
    const parsedNotificationId = uuidToBin(notificationId);

    const isExist = await NotificationRepository.verifyUserNotification(
      parsedId,
      parsedNotificationId,
    );

    if (!isExist) {
      throw new NotificationNotFoundError('알림이 존재하지 않습니다.', { userId });
    }

    const result = await NotificationRepository.deleteNotification(parsedId, parsedNotificationId);

    return binToUuid(result.notification_id);
  }

  static async deleteAllNotificationService(userId: string) {
    const parsedId = uuidToBin(userId);

    const result = await NotificationRepository.deleteAllNotification(parsedId);

    if (result === 0) {
      throw new NotificationNotFoundError('알림이 존재하지 않습니다.', { userId });
    }

    return result;
  }
}
