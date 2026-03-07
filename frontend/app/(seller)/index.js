import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, ActivityIndicator, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import API from '../../constants/api';

const { width } = Dimensions.get('window');

const SellerDashboardScreen = () => {
    const router = useRouter();
    const { user } = useContext(AuthContext);
    const [isOnline, setIsOnline] = useState(true);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        revenue: 0,
        orders: 0,
        rating: 4.8,
        activeHotels: 0
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const res = await axios.get(`${API.SELLER}/analytics`);

            setStats({
                revenue: res.data.revenue || 0,
                orders: res.data.orders || 0,
                rating: res.data.rating || 0,
                activeHotels: res.data.activeHotels || 0
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderStatCard = (title, value, icon, trend, color) => (
        <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: color + '15' }]}>
                <Ionicons name={icon} size={20} color={color} />
            </View>
            <View style={styles.statInfo}>
                <Text style={styles.statLabel}>{title}</Text>
                <Text style={styles.statValue}>{value}</Text>
                {trend && (
                    <View style={styles.trendRow}>
                        <Ionicons name="trending-up" size={12} color={COLORS.primary} />
                        <Text style={styles.trendText}>{trend}</Text>
                    </View>
                )}
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Merchant Header */}
            <View style={[styles.header, isOnline ? styles.headerOnline : styles.headerOffline]}>
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.welcomeText}>Hello, {user?.name.split(' ')[0]}</Text>
                        <Text style={styles.storeName}>Merchant Dashboard</Text>
                    </View>
                    <TouchableOpacity style={styles.notificationBtn}>
                        <Ionicons name="notifications-outline" size={24} color={COLORS.white} />
                        <View style={styles.notificationBadge} />
                    </TouchableOpacity>
                </View>

                <View style={styles.statusToggleBar}>
                    <View style={styles.statusInfo}>
                        <View style={[styles.statusDot, { backgroundColor: isOnline ? '#4ADE80' : '#F87171' }]} />
                        <Text style={styles.statusLabelText}>
                            {isOnline ? 'Go Offline' : 'Go Online'}
                        </Text>
                    </View>
                    <Switch
                        value={isOnline}
                        onValueChange={setIsOnline}
                        trackColor={{ false: 'rgba(255,255,255,0.3)', true: 'rgba(255,255,255,0.3)' }}
                        thumbColor={COLORS.white}
                    />
                </View>
            </View>

            <View style={styles.content}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Overview</Text>
                    <TouchableOpacity>
                        <Text style={styles.seeAllText}>This Week</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.statsGrid}>
                    {renderStatCard('Revenue', `$${stats.revenue}`, 'wallet-outline', '+8.2%', '#3B82F6')}
                    {renderStatCard('Orders', stats.orders, 'cart-outline', '+12', COLORS.primary)}
                    {renderStatCard('Rating', stats.rating, 'star-outline', 'Excellent', '#F59E0B')}
                    {renderStatCard('Stores', stats.activeHotels, 'business-outline', null, COLORS.secondary)}
                </View>

                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.actionsGrid}>
                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => router.push('/(seller)/profile')}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: '#EEF2FF' }]}>
                            <Ionicons name="brush-outline" size={24} color="#6366F1" />
                        </View>
                        <Text style={styles.actionLabel}>Branding</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => router.push('/(seller)/hotels')}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: '#ECFDF5' }]}>
                            <Ionicons name="storefront-outline" size={24} color={COLORS.primary} />
                        </View>
                        <Text style={styles.actionLabel}>Hotels</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => router.push('/(seller)/dishes')}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: '#FFF7ED' }]}>
                            <Ionicons name="cube-outline" size={24} color="#F97316" />
                        </View>
                        <Text style={styles.actionLabel}>Catalog</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionCard}>
                        <View style={[styles.actionIcon, { backgroundColor: '#FDF2F8' }]}>
                            <Ionicons name="analytics-outline" size={24} color="#EC4899" />
                        </View>
                        <Text style={styles.actionLabel}>Insights</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.promoCard}>
                    <View style={styles.promoContent}>
                        <Text style={styles.promoTitle}>Grow your business</Text>
                        <Text style={styles.promoDesc}>Learn how to optimize your catalog for more sales.</Text>
                        <TouchableOpacity style={styles.promoBtn}>
                            <Text style={styles.promoBtnText}>View Tips</Text>
                        </TouchableOpacity>
                    </View>
                    <Ionicons name="rocket-outline" size={60} color="rgba(255,255,255,0.2)" style={styles.promoIcon} />
                </View>

                <TouchableOpacity style={styles.logoutBtn} onPress={() => router.replace('/(auth)/login')}>
                    <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
                    <Text style={styles.logoutText}>Log Out Account</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.xl,
        borderBottomLeftRadius: RADIUS.xl,
        borderBottomRightRadius: RADIUS.xl,
        ...SHADOWS.medium,
    },
    headerOnline: {
        backgroundColor: COLORS.primary,
    },
    headerOffline: {
        backgroundColor: COLORS.secondary,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    welcomeText: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
    },
    storeName: {
        fontSize: 24,
        fontWeight: '800',
        color: COLORS.white,
        marginTop: 2,
    },
    notificationBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FF4B4B',
        borderWidth: 1.5,
        borderColor: COLORS.primary,
    },
    statusToggleBar: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,0.1)',
        marginTop: SPACING.xl,
        padding: SPACING.md,
        borderRadius: RADIUS.lg,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    statusInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 10,
    },
    statusLabelText: {
        color: COLORS.white,
        fontSize: 15,
        fontWeight: '600',
    },
    content: {
        padding: SPACING.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.secondary,
    },
    seeAllText: {
        fontSize: 14,
        color: COLORS.primary,
        fontWeight: '600',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: SPACING.xl,
    },
    statCard: {
        width: (width - SPACING.lg * 2 - 12) / 2,
        backgroundColor: COLORS.white,
        padding: SPACING.md,
        borderRadius: RADIUS.lg,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        ...SHADOWS.light,
    },
    statIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    statInfo: {
        flex: 1,
    },
    statLabel: {
        fontSize: 11,
        color: COLORS.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statValue: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.secondary,
        marginTop: 2,
    },
    trendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    trendText: {
        fontSize: 10,
        color: COLORS.primary,
        fontWeight: '700',
        marginLeft: 2,
    },
    actionsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: SPACING.md,
        marginBottom: SPACING.xl,
    },
    actionCard: {
        width: (width - SPACING.lg * 2 - 30) / 4,
        alignItems: 'center',
    },
    actionIcon: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        ...SHADOWS.light,
    },
    actionLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.secondary,
    },
    promoCard: {
        backgroundColor: COLORS.secondary,
        borderRadius: RADIUS.xl,
        padding: SPACING.xl,
        flexDirection: 'row',
        overflow: 'hidden',
        marginBottom: SPACING.xl,
    },
    promoContent: {
        flex: 1,
        zIndex: 1,
    },
    promoTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    promoDesc: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 4,
        lineHeight: 18,
    },
    promoBtn: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: RADIUS.md,
        alignSelf: 'flex-start',
        marginTop: 16,
    },
    promoBtnText: {
        color: COLORS.white,
        fontSize: 13,
        fontWeight: 'bold',
    },
    promoIcon: {
        position: 'absolute',
        right: -10,
        bottom: -10,
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.md,
        marginTop: SPACING.md,
        marginBottom: SPACING.xxl,
    },
    logoutText: {
        color: COLORS.error,
        fontWeight: '600',
        marginLeft: 8,
    }
});

export default SellerDashboardScreen;
