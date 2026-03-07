import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import API from '../constants/api';
import { auth } from '../config/firebase';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';

export const AuthContext = createContext();

const API_URL = API.AUTH;

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        checkLoggedUser();
    }, []);

    const checkLoggedUser = async () => {
        setIsLoading(true);
        try {
            const storedUser = await AsyncStorage.getItem('user');
            const token = await AsyncStorage.getItem('token');

            if (storedUser && token) {
                // Here we could also verify the token with the backend
                setUser(JSON.parse(storedUser));
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            }
        } catch (e) {
            console.log('Error reading storage', e);
        }
        setIsLoading(false);
    };

    const login = async (email, password, phone) => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await axios.post(`${API_URL}/login`, { email, password, phone });
            const userData = res.data;

            setUser(userData);
            await AsyncStorage.setItem('user', JSON.stringify(userData));
            await AsyncStorage.setItem('token', userData.token);

            // Set default header
            axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;

        } catch (e) {
            setError(e.response?.data?.message || 'Login failed');
        }
        setIsLoading(false);
    };

    const register = async (name, email, password, role, phone) => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await axios.post(`${API_URL}/register`, { name, email, password, role, phone });
            const userData = res.data;

            setUser(userData);
            await AsyncStorage.setItem('user', JSON.stringify(userData));
            await AsyncStorage.setItem('token', userData.token);

            axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;

        } catch (e) {
            setError(e.response?.data?.message || 'Registration failed');
        }
        setIsLoading(false);
    };

    const loginWithGoogle = async (role = 'buyer') => {
        setIsLoading(true);
        setError(null);
        try {
            let GoogleSignin;
            try {
                GoogleSignin = require('@react-native-google-signin/google-signin').GoogleSignin;
            } catch (e) {
                throw new Error("Google Sign-In is not available in Expo Go. Please build a custom dev client.");
            }

            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
            const { data } = await GoogleSignin.signIn();
            const idToken = data?.idToken || data?.token; // Try both properties for compatibility across versions

            if (!idToken) {
                throw new Error("No ID Token found from Google Sign-In");
            }

            const googleCredential = GoogleAuthProvider.credential(idToken);
            const userCredential = await signInWithCredential(auth, googleCredential);
            const firebaseIdToken = await userCredential.user.getIdToken();

            const res = await axios.post(`${API_URL}/google`, { idToken: firebaseIdToken, role });
            const userData = res.data;

            setUser(userData);
            await AsyncStorage.setItem('user', JSON.stringify(userData));
            await AsyncStorage.setItem('token', userData.token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;

        } catch (e) {
            console.log('Google Sign-In Error:', e);
            setError(e.response?.data?.message || e.message || 'Google Sign-In failed');
        }
        setIsLoading(false);
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            await AsyncStorage.removeItem('user');
            await AsyncStorage.removeItem('token');
            setUser(null);
            delete axios.defaults.headers.common['Authorization'];
        } catch (e) {
            console.log('Error removing storage', e);
        }
        setIsLoading(false);
    };

    const updateProfile = async (name, avatar, bio) => {
        setIsLoading(true);
        console.log('AuthContext: Starting profile update...');
        try {
            const api_endpoint = `${API_URL}/update-profile`;
            console.log(`AuthContext: Sending PUT request to ${api_endpoint}`);

            const res = await axios.put(api_endpoint, { name, avatar, bio });
            console.log('AuthContext: API call successful, updating local state...');

            const updatedUser = res.data;
            setUser(updatedUser);

            console.log('AuthContext: Saving user to AsyncStorage...');
            await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
            console.log('AuthContext: Profile update complete!');
        } catch (e) {
            console.error('AuthContext: Update profile error:', e);
            console.error('AuthContext: Error details:', e.response?.data || e.message);
            setError(e.response?.data?.message || 'Update failed');
            throw e; // Re-throw so component can handle it if needed
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, error, login, loginWithGoogle, register, logout, updateProfile, setError }}>
            {children}
        </AuthContext.Provider>
    );
};
