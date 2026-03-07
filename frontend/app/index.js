import React, { useContext, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthContext } from '../context/AuthContext';

export default function InitialEntry() {
    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#0066cc" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    }
});
