import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Geolocation } from '@capacitor/geolocation';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export class MobileServices {
  static async initializeApp() {
    if (!Capacitor.isNativePlatform()) return;

    try {
      // Hide splash screen after app loads
      await SplashScreen.hide();

      // Set status bar style
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: '#FF9933' });

      // Initialize push notifications
      await this.initializePushNotifications();

      console.log('Mobile services initialized successfully');
    } catch (error) {
      console.error('Error initializing mobile services:', error);
    }
  }

  // Push Notifications for spiritual reminders
  static async initializePushNotifications() {
    if (!Capacitor.isNativePlatform()) return;

    try {
      const result = await PushNotifications.requestPermissions();
      
      if (result.receive === 'granted') {
        await PushNotifications.register();
        
        PushNotifications.addListener('registration', (token) => {
          console.log('Push registration success, token:', token.value);
        });

        PushNotifications.addListener('registrationError', (error) => {
          console.error('Error on registration:', error);
        });

        PushNotifications.addListener('pushNotificationReceived', (notification) => {
          console.log('Push received:', notification);
          // Handle incoming spiritual notifications
        });

        PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
          console.log('Push action performed:', action);
          // Handle notification tap actions
        });
      }
    } catch (error) {
      console.error('Push notification setup error:', error);
    }
  }

  // Schedule spiritual practice reminders
  static async scheduleAartiReminder(title: string, body: string, time: Date) {
    if (!Capacitor.isNativePlatform()) return;

    try {
      const permission = await LocalNotifications.requestPermissions();
      if (permission.display === 'granted') {
        await LocalNotifications.schedule({
          notifications: [{
            title,
            body,
            id: Math.floor(Math.random() * 10000),
            schedule: { at: time },
            sound: 'beep.wav',
            attachments: undefined,
            actionTypeId: "",
            extra: {
              type: 'aarti_reminder'
            }
          }]
        });
      }
    } catch (error) {
      console.error('Error scheduling aarti reminder:', error);
    }
  }

  // Get current location for nearby temples
  static async getCurrentLocation() {
    if (!Capacitor.isNativePlatform()) {
      // Fallback for web
      return new Promise<{ latitude: number; longitude: number }>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }),
          reject
        );
      });
    }

    try {
      const permissions = await Geolocation.requestPermissions();
      if (permissions.location === 'granted') {
        const position = await Geolocation.getCurrentPosition();
        return {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
      }
    } catch (error) {
      console.error('Error getting location:', error);
      throw error;
    }
  }

  // Take photo for temple visits or community posts
  static async takePhoto() {
    if (!Capacitor.isNativePlatform()) {
      // Fallback for web - file input
      return new Promise<string>((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e: any) => {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          }
        };
        input.click();
      });
    }

    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera
      });

      return image.dataUrl || '';
    } catch (error) {
      console.error('Error taking photo:', error);
      throw error;
    }
  }

  // Haptic feedback for spiritual interactions
  static async vibrate(style: 'light' | 'medium' | 'heavy' = 'light') {
    if (!Capacitor.isNativePlatform()) return;

    try {
      const impactStyle = style === 'light' ? ImpactStyle.Light : 
                         style === 'medium' ? ImpactStyle.Medium : 
                         ImpactStyle.Heavy;
      
      await Haptics.impact({ style: impactStyle });
    } catch (error) {
      console.error('Haptic feedback error:', error);
    }
  }

  // Check if running on mobile device
  static isMobile() {
    return Capacitor.isNativePlatform();
  }

  // Get platform info
  static getPlatform() {
    return Capacitor.getPlatform();
  }

  // Schedule daily spiritual reminders
  static async scheduleDailyReminders(preferences: {
    morningAarti?: boolean;
    eveningAarti?: boolean;
    mantraReminder?: boolean;
    meditationReminder?: boolean;
  }) {
    if (!Capacitor.isNativePlatform()) return;

    const notifications = [];

    if (preferences.morningAarti) {
      notifications.push({
        title: '🌅 Morning Aarti Time',
        body: 'Start your day with divine blessings. Join the morning aarti.',
        id: 1001,
        schedule: { 
          on: { 
            hour: 6, 
            minute: 0 
          },
          repeats: true
        },
        extra: { type: 'morning_aarti' }
      });
    }

    if (preferences.eveningAarti) {
      notifications.push({
        title: '🪔 Evening Aarti Time',
        body: 'End your day with gratitude. Join the evening aarti.',
        id: 1002,
        schedule: { 
          on: { 
            hour: 18, 
            minute: 0 
          },
          repeats: true
        },
        extra: { type: 'evening_aarti' }
      });
    }

    if (preferences.mantraReminder) {
      notifications.push({
        title: '📿 Mantra Practice',
        body: 'Continue your spiritual journey with mantra chanting.',
        id: 1003,
        schedule: { 
          on: { 
            hour: 9, 
            minute: 0 
          },
          repeats: true
        },
        extra: { type: 'mantra_reminder' }
      });
    }

    if (preferences.meditationReminder) {
      notifications.push({
        title: '🧘‍♀️ Meditation Time',
        body: 'Find inner peace through meditation practice.',
        id: 1004,
        schedule: { 
          on: { 
            hour: 20, 
            minute: 0 
          },
          repeats: true
        },
        extra: { type: 'meditation_reminder' }
      });
    }

    try {
      await LocalNotifications.schedule({ notifications });
      console.log('Daily reminders scheduled successfully');
    } catch (error) {
      console.error('Error scheduling daily reminders:', error);
    }
  }

  // Clear all notifications
  static async clearAllNotifications() {
    if (!Capacitor.isNativePlatform()) return;

    try {
      await LocalNotifications.cancel({ notifications: [
        { id: 1001 }, { id: 1002 }, { id: 1003 }, { id: 1004 }
      ]});
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }
}

// Initialize mobile services when the module loads
if (typeof window !== 'undefined') {
  MobileServices.initializeApp();
}