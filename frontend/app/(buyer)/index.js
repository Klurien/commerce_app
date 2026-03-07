import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, ActivityIndicator, TextInput, ScrollView, Dimensions, StatusBar, RefreshControl } from 'react-native';
import axios from 'axios';
import API from '../../constants/api';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const CATEGORIES = [
    { id: '1', name: 'Fast Food', emoji: '🍔' },
    { id: '2', name: 'Pizza', emoji: '🍕' },
    { id: '3', name: 'Healthy', emoji: '🥗' },
    { id: '4', name: 'Drinks', emoji: '🥤' },
    { id: '5', name: 'Desserts', emoji: '🍰' },
];

const BuyerHomeScreen = () => {
    const [dishes, setDishes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [activeCategory, setActiveCategory] = useState(null);
    const router = useRouter();

    useEffect(() => {
        fetchDishes(1, true);
    }, []);

    const fetchDishes = async (pageNum, isRefresh = false) => {
        if (!isRefresh && (loadingMore || !hasMore)) return;

        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoadingMore(true);
        }

        try {
            const { data } = await axios.get(`${API.BUYER}/dishes?page=${pageNum}&limit=6`);

            if (isRefresh) {
                setDishes(data.dishes);
            } else {
                setDishes(prev => [...prev, ...data.dishes]);
            }

            setPage(data.currentPage);
            setHasMore(data.hasMore);
        } catch (error) {
            console.error('Error fetching dishes:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
            setLoadingMore(false);
        }
    };

    const handleRefresh = () => {
        setPage(1);
        setHasMore(true);
        fetchDishes(1, true);
    };

    const handleLoadMore = () => {
        if (hasMore && !loadingMore) {
            fetchDishes(page + 1);
        }
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.topBar}>
                <View>
                    <Text style={styles.welcomeText}>Explore Taste</Text>
                    <TouchableOpacity style={styles.locationRow}>
                        <Text style={styles.locationText} numberOfLines={1}>All Stores 🌎</Text>
                        <Ionicons name="chevron-down" size={14} color={COLORS.primary} />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.profileBtn} onPress={() => router.push('/(buyer)/profile')}>
                    <Ionicons name="person-circle-outline" size={32} color={COLORS.secondary} />
                </TouchableOpacity>
            </View>

            <View style={styles.searchBar}>
                <Ionicons name="search-outline" size={20} color={COLORS.textMuted} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search for your favorite food"
                    placeholderTextColor={COLORS.textMuted}
                />
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryScroll}
            >
                {CATEGORIES.map(cat => (
                    <TouchableOpacity
                        key={cat.id}
                        style={[
                            styles.catItem,
                            activeCategory === cat.id && styles.catItemActive
                        ]}
                    >
                        <View style={[styles.catIcon, activeCategory === cat.id && styles.catIconActive]}>
                            <Text style={styles.catEmoji}>{cat.emoji}</Text>
                        </View>
                        <Text style={[styles.catLabel, activeCategory === cat.id && styles.catLabelActive]}>
                            {cat.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Fresh For You</Text>
                <Ionicons name="flame" size={20} color={COLORS.primary} />
            </View>
        </View>
    );

    const renderDishItem = ({ item }) => (
        <TouchableOpacity
            style={styles.dishCard}
            onPress={() => router.push(`/(buyer)/food/${item._id}`)}
            activeOpacity={0.9}
        >
            <Image
                source={{ uri: item.image || 'https://via.placeholder.com/400x300' }}
                style={styles.dishImage}
            />

            <View style={styles.dishOverlay}>
                <View style={styles.priceTag}>
                    <Text style={styles.priceText}>${item.price.toFixed(2)}</Text>
                </View>
            </View>

            <View style={styles.cardInfo}>
                <View style={styles.dishHeader}>
                    <Text style={styles.dishName}>{item.name}</Text>
                    <View style={styles.ratingBadge}>
                        <Ionicons name="star" size={12} color="#F59E0B" />
                        <Text style={styles.ratingText}>4.8</Text>
                    </View>
                </View>

                <Text style={styles.dishDesc} numberOfLines={1}>{item.description}</Text>

                <View style={styles.storeRow}>
                    <View style={styles.storeAvatar}>
                        {item.hotelId?.logo ? (
                            <Image source={{ uri: item.hotelId.logo }} style={styles.avatarImg} />
                        ) : (
                            <Ionicons name="business" size={14} color={COLORS.textMuted} />
                        )}
                    </View>
                    <Text style={styles.storeName}>{item.hotelId?.name || 'Local Seller'}</Text>
                    <View style={styles.dot} />
                    <Text style={styles.deliveryTime}>25 min</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderFooter = () => {
        if (!loadingMore) return <View style={{ height: 40 }} />;
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator color={COLORS.primary} />
                <Text style={styles.loadingMoreText}>Hunting for more dishes...</Text>
            </View>
        );
    };

    if (loading && page === 1) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <FlatList
                data={dishes}
                keyExtractor={(item, index) => `${item._id}-${index}`}
                renderItem={renderDishItem}
                ListHeaderComponent={renderHeader}
                ListFooterComponent={renderFooter}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                onRefresh={handleRefresh}
                refreshing={refreshing}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="cube-outline" size={60} color={COLORS.border} />
                        <Text style={styles.emptyText}>No products available yet. Check back soon!</Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: SPACING.lg,
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    welcomeText: {
        fontSize: 12,
        color: COLORS.textMuted,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    locationText: {
        fontSize: 20,
        fontWeight: '900',
        color: COLORS.secondary,
        marginRight: 4,
    },
    profileBtn: {
        padding: 2,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        borderRadius: RADIUS.xl,
        paddingHorizontal: SPACING.md,
        height: 50,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: SPACING.xl,
    },
    searchInput: {
        flex: 1,
        height: '100%',
        marginLeft: 10,
        fontSize: 15,
        color: COLORS.secondary,
        fontWeight: '500',
    },
    categoryScroll: {
        paddingBottom: SPACING.xl,
    },
    catItem: {
        alignItems: 'center',
        marginRight: 24,
    },
    catIcon: {
        width: 54,
        height: 54,
        borderRadius: 27,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        ...SHADOWS.light,
    },
    catIconActive: {
        backgroundColor: COLORS.primary,
    },
    catEmoji: {
        fontSize: 20,
    },
    catLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: COLORS.textMuted,
    },
    catLabelActive: {
        color: COLORS.primary,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: COLORS.secondary,
        marginRight: 8,
    },
    listContainer: {
        paddingBottom: 40,
    },
    dishCard: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.xl,
        marginHorizontal: SPACING.lg,
        marginBottom: SPACING.xl,
        ...SHADOWS.medium,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    dishImage: {
        width: '100%',
        height: 220,
        backgroundColor: COLORS.background,
    },
    dishOverlay: {
        position: 'absolute',
        top: 15,
        right: 15,
    },
    priceTag: {
        backgroundColor: COLORS.white,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: RADIUS.md,
        ...SHADOWS.medium,
    },
    priceText: {
        fontSize: 16,
        fontWeight: '900',
        color: COLORS.primary,
    },
    cardInfo: {
        padding: SPACING.lg,
    },
    dishHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    dishName: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.secondary,
        flex: 1,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFBEB',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: RADIUS.sm,
    },
    ratingText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#92400E',
        marginLeft: 4,
    },
    dishDesc: {
        fontSize: 13,
        color: COLORS.textMuted,
        marginBottom: SPACING.md,
        lineHeight: 18,
    },
    storeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        paddingTop: SPACING.md,
    },
    storeAvatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    avatarImg: {
        width: '100%',
        height: '100%',
    },
    storeName: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.secondary,
    },
    dot: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: COLORS.border,
        marginHorizontal: 8,
    },
    deliveryTime: {
        fontSize: 12,
        color: COLORS.textMuted,
        fontWeight: '600',
    },
    footerLoader: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    loadingMoreText: {
        fontSize: 12,
        color: COLORS.textMuted,
        fontWeight: '600',
        marginTop: 8,
    },
    emptyState: {
        paddingTop: 100,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: COLORS.textMuted,
        marginTop: 16,
    },
});

export default BuyerHomeScreen;
