import React, { useState, useCallback, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import axios from 'axios';
import API from '../../constants/api';
import { AuthContext } from '../../context/AuthContext';

const ManageHotelsScreen = () => {
    const router = useRouter();
    const { user } = useContext(AuthContext);
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            fetchHotels();
        }, [])
    );

    const fetchHotels = async () => {
        try {
            const { data } = await axios.get(`${API.SELLER}/hotels`);
            setHotels(data);
        } catch (error) {
            console.error('Error fetching hotels:', error);
            Alert.alert('Error', 'Failed to load your businesses.');
        } finally {
            setLoading(false);
        }
    };

    const renderHotelItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/(seller)/business/${item._id}`)}
        >
            <Image
                source={{ uri: item.image || 'https://via.placeholder.com/150' }}
                style={styles.hotelImage}
            />
            <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                    <Text style={styles.hotelName} numberOfLines={1}>{item.name}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: '#E8F5E9' }]}>
                        <Text style={styles.statusText}>Active</Text>
                    </View>
                </View>
                <Text style={styles.hotelAddress} numberOfLines={1}>
                    <Ionicons name="location-outline" size={12} color={COLORS.textMuted} /> {item.address}
                </Text>
                <View style={styles.cardFooter}>
                    <Text style={styles.categoryText}>{item.category || 'Restaurant'}</Text>
                    <View style={styles.ratingRow}>
                        <Ionicons name="star" size={14} color="#F59E0B" />
                        <Text style={styles.ratingText}>{item.rating || '0.0'}</Text>
                    </View>
                </View>
                {/* Tap hint */}
                <View style={styles.viewProductsRow}>
                    <Ionicons name="cube-outline" size={13} color={COLORS.primary} />
                    <Text style={styles.viewProductsText}>View Products →</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>My Businesses</Text>
                <Text style={styles.subtitle}>{hotels.length} businesses managed</Text>
            </View>

            <FlatList
                data={hotels}
                keyExtractor={(item) => item._id}
                renderItem={renderHotelItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="business-outline" size={60} color={COLORS.border} />
                        <Text style={styles.emptyText}>No businesses listed yet.</Text>
                        <TouchableOpacity
                            style={styles.addBtn}
                            onPress={() => router.push('/(seller)/profile')}
                        >
                            <Text style={styles.addBtnText}>Add Your First Business</Text>
                        </TouchableOpacity>
                    </View>
                }
            />

            <TouchableOpacity
                style={styles.fab}
                onPress={() => router.push('/(seller)/profile')}
            >
                <Ionicons name="add" size={30} color={COLORS.white} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        paddingHorizontal: SPACING.lg,
        paddingTop: 60,
        paddingBottom: SPACING.md,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: COLORS.secondary,
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.textMuted,
        marginTop: 4,
    },
    listContent: {
        padding: SPACING.lg,
        paddingBottom: 100,
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.xl,
        marginBottom: SPACING.lg,
        ...SHADOWS.medium,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    hotelImage: {
        width: '100%',
        height: 160,
    },
    cardContent: {
        padding: SPACING.md,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    hotelName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.secondary,
        flex: 1,
        marginRight: 8,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: RADIUS.sm,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '800',
        color: COLORS.primary,
        textTransform: 'uppercase',
    },
    hotelAddress: {
        fontSize: 13,
        color: COLORS.textMuted,
        marginTop: 4,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: SPACING.md,
        paddingTop: SPACING.sm,
        borderTopWidth: 1,
        borderTopColor: COLORS.background,
    },
    categoryText: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.primary,
        backgroundColor: COLORS.background,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.secondary,
        marginLeft: 4,
    },
    viewProductsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: SPACING.sm,
        gap: 4,
    },
    viewProductsText: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.primary,
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.medium,
        elevation: 6,
    },
    emptyContainer: {
        paddingTop: 100,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: COLORS.textMuted,
        marginTop: 16,
        marginBottom: 24,
    },
    addBtn: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: RADIUS.round,
    },
    addBtnText: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: 14,
    }
});

export default ManageHotelsScreen;
