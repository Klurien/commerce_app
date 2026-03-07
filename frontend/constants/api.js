import { Platform } from 'react-native';
import Constants from 'expo-constants';

// For physical devices, we need the machine's local IP address
// hostUri looks like "192.168.1.5:8081"
const hostUri = Constants.expoConfig?.hostUri;
const machineIp = hostUri ? hostUri.split(':')[0] : 'localhost';

const LOCALHOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const PRODUCTION_URL = 'https://commerce-api.onrender.com/api';

// Use production by default for builds, use local IP/localhost for development
// If you are using Expo Go on a physical device, it will use machineIp
const API_IP = (__DEV__ && hostUri) ? machineIp : LOCALHOST;
const DEV_URL = `http://${API_IP}:5000/api`;

export const BASE_URL = __DEV__ ? DEV_URL : PRODUCTION_URL;

export default {
    BASE_URL,
    AUTH: `${BASE_URL}/auth`,
    BUYER: `${BASE_URL}/buyer`,
    SELLER: `${BASE_URL}/seller`,
    ADMIN: `${BASE_URL}/admin`,
};
