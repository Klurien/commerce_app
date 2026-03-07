import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import axios from 'axios';
import API from '../constants/api'; // Add this import

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            console.log('Failed to get push token for push notification!');
            return;
        }
        const projectId =
            Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
        if (!projectId) {
            console.log('Project ID not found. Ensure app.json has expo.extra.eas.projectId.');
        }
        token = await Notifications.getExpoPushTokenAsync({
            projectId,
        });
    } else {
        console.log('Must use physical device for Push Notifications');
    }

    return token?.data;
}

export function usePushNotifications(userToken) {
    const [expoPushToken, setExpoPushToken] = useState('');
    const [notification, setNotification] = useState(false);
    const notificationListener = useRef();
    const responseListener = useRef();

    useEffect(() => {
        registerForPushNotificationsAsync().then((token) => {
            if (token) {
                setExpoPushToken(token);
                // If we have a userToken, attempt to send push token to backend
                if (userToken) {
                    sendPushTokenToBackend(token, userToken);
                }
            }
        });

        notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
            setNotification(notification);
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
            console.log('Notification Response:', response);
        });

        return () => {
            Notifications.removeNotificationSubscription(notificationListener.current);
            Notifications.removeNotificationSubscription(responseListener.current);
        };
    }, [userToken]);

    const sendPushTokenToBackend = async (pushToken, userAuthToken) => {
        try {
            const baseUrl = API.AUTH; // Uses the same base URL configured for the Auth subsystem

            await axios.put(`${baseUrl}/push-token`, {
                token: pushToken
            }, {
                headers: {
                    Authorization: `Bearer ${userAuthToken}`
                }
            });
            console.log('Successfully registered Push Token:', pushToken);
        } catch (error) {
            console.error('Error saving push token to backend:', error?.response?.data || error.message);
        }
    };

    return {
        expoPushToken,
        notification,
    };
}
