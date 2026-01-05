import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Check if running in Expo Go (notifications have limited functionality in Expo Go)
const isExpoGo = Constants.appOwnership === 'expo';

// Only import Notifications if not in Expo Go
let Notifications = null;
if (!isExpoGo) {
  Notifications = require('expo-notifications');
}

// Configure notification behavior
export const configureNotifications = () => {
  if (!Notifications) return;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
};

// Request notification permissions
export const requestNotificationPermissions = async () => {
  if (!Notifications) {
    console.log('Notifications not available in Expo Go');
    return { status: 'unavailable' };
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return { status: finalStatus };
  } catch (error) {
    console.log('Error requesting notification permissions:', error);
    return { status: 'error', error };
  }
};

// Get push token for remote notifications (for future backend integration)
export const getPushToken = async () => {
  if (!Notifications) return null;

  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') return null;

    // Get the Expo push token
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    });

    return token.data;
  } catch (error) {
    console.log('Error getting push token:', error);
    return null;
  }
};

// Schedule a local notification for buddy request
export const scheduleBuddyRequestNotification = async (senderName) => {
  if (!Notifications) {
    console.log('Notifications not available in Expo Go');
    return null;
  }

  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      console.log('Notification permission not granted');
      return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'New Buddy Request!',
        body: `${senderName} wants to be your travel buddy`,
        data: { type: 'buddy_request', senderName },
        sound: true,
      },
      trigger: null, // Show immediately
    });

    return notificationId;
  } catch (error) {
    console.log('Error scheduling notification:', error);
    return null;
  }
};

// Schedule a notification for accepted buddy request
export const scheduleBuddyAcceptedNotification = async (buddyName) => {
  if (!Notifications) return null;

  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') return null;

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Buddy Request Accepted!',
        body: `You and ${buddyName} are now travel buddies`,
        data: { type: 'buddy_accepted', buddyName },
        sound: true,
      },
      trigger: null,
    });

    return notificationId;
  } catch (error) {
    console.log('Error scheduling notification:', error);
    return null;
  }
};

// Set app badge count (for iOS)
export const setBadgeCount = async (count) => {
  if (!Notifications) return;

  try {
    await Notifications.setBadgeCountAsync(count);
  } catch (error) {
    console.log('Error setting badge count:', error);
  }
};

// Clear all notifications
export const clearAllNotifications = async () => {
  if (!Notifications) return;

  try {
    await Notifications.dismissAllNotificationsAsync();
    await Notifications.setBadgeCountAsync(0);
  } catch (error) {
    console.log('Error clearing notifications:', error);
  }
};

// Add notification response listener
export const addNotificationResponseListener = (callback) => {
  if (!Notifications) return null;

  return Notifications.addNotificationResponseReceivedListener(callback);
};

// Add notification received listener (when app is in foreground)
export const addNotificationReceivedListener = (callback) => {
  if (!Notifications) return null;

  return Notifications.addNotificationReceivedListener(callback);
};

// Check if notifications are available
export const isNotificationsAvailable = () => {
  return Notifications !== null;
};

export default {
  configureNotifications,
  requestNotificationPermissions,
  getPushToken,
  scheduleBuddyRequestNotification,
  scheduleBuddyAcceptedNotification,
  setBadgeCount,
  clearAllNotifications,
  addNotificationResponseListener,
  addNotificationReceivedListener,
  isNotificationsAvailable,
};
