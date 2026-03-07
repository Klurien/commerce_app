import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePushNotifications } from '../../hooks/usePushNotifications';

export default function SellerLayout() {
  const { user } = useContext(AuthContext);
  const [userToken, setUserToken] = useState(null);

  useEffect(() => {
    const fetchToken = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) setUserToken(token);
    };
    fetchToken();
  }, [user]);

  // Hook handles registering token with the backend automatically when available
  usePushNotifications(userToken);
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#2e7d32', headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <Ionicons name="stats-chart" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="hotels"
        options={{
          title: 'My Hotels',
          tabBarIcon: ({ color }) => <Ionicons name="business" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="dishes"
        options={{
          title: 'My Products',
          tabBarIcon: ({ color }) => <Ionicons name="restaurant" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
        }}
      />
      {/* Hidden screens — not shown in tab bar */}
      <Tabs.Screen
        name="business/[id]"
        options={{
          href: null,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
