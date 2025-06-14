declare module 'react-native-push-notification' {
  export interface PushNotificationToken {
    token: string;
    os: string;
  }

  export interface PushNotificationData {
    [key: string]: any;
  }

  export interface PushNotification {
    foreground: boolean;
    userInteraction: boolean;
    message: string;
    data: PushNotificationData;
    badge?: number;
    alert?: any;
    sound?: string;
  }

  export enum Importance {
    DEFAULT = 'default',
    HIGH = 'high',
    LOW = 'low',
    MIN = 'min',
  }

  export interface ChannelObject {
    channelId: string;
    channelName: string;
    channelDescription?: string;
    importance?: Importance;
    vibrate?: boolean;
  }

  export interface PushNotificationConfig {
    onRegister?: (token: PushNotificationToken) => void;
    onNotification?: (notification: PushNotification) => void;
    senderID?: string;
    permissions?: {
      alert?: boolean;
      badge?: boolean;
      sound?: boolean;
    };
    popInitialNotification?: boolean;
    requestPermissions?: boolean;
  }

  export default class PushNotificationClass {
    static configure(config: PushNotificationConfig): void;
    static createChannel(
      channel: ChannelObject,
      callback?: (created: boolean) => void
    ): void;
  }

  export { Importance };
} 