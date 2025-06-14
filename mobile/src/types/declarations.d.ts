/**
 * Type declarations for modules without TypeScript support
 */

declare module 'react-native-push-notification' {
  export interface PushNotificationPermissions {
    alert?: boolean;
    badge?: boolean;
    sound?: boolean;
  }

  export interface PushNotificationToken {
    token: string;
    os: string;
  }

  export interface PushNotificationObject {
    foreground: boolean;
    userInteraction: boolean;
    message: string;
    data: any;
    badge?: number;
    alert?: any;
    sound?: string;
    finish?: (fetchResult: any) => void;
    title?: string;
    body?: string;
  }

  export interface PushNotificationOptions {
    onRegister?: (token: PushNotificationToken) => void;
    onNotification?: (notification: PushNotificationObject) => void;
    senderID?: string;
    permissions?: PushNotificationPermissions;
    popInitialNotification?: boolean;
    requestPermissions?: boolean;
  }

  export interface ChannelObject {
    channelId: string;
    channelName: string;
    channelDescription?: string;
    importance?: number;
    vibrate?: boolean;
  }

  export enum Importance {
    DEFAULT = 3,
    HIGH = 4,
    LOW = 2,
    MIN = 1,
    NONE = 0,
  }

  export interface LocalNotificationObject {
    id?: string;
    title?: string;
    message: string;
    date?: Date;
    userInfo?: any;
    playSound?: boolean;
    soundName?: string;
    number?: number;
    repeatType?: 'week' | 'day' | 'hour' | 'minute' | 'time';
  }

  class PushNotification {
    static configure(options: PushNotificationOptions): void;
    static requestPermissions(): Promise<PushNotificationPermissions>;
    static createChannel(
      channel: ChannelObject,
      callback?: (created: boolean) => void
    ): void;
    static localNotificationSchedule(notification: LocalNotificationObject): void;
    static cancelLocalNotifications(userInfo: any): void;
  }

  export default PushNotification;
  export { PushNotification };
} 