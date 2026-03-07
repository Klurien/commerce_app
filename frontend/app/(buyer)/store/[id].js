import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform, Dimensions, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';
import API from '../../../constants/api';
import { CartContext } from '../../../context/CartContext';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - SPACING.lg * 2 - 12) / 2;

const StorefrontScreen = () => {
    const { id } = useLocalSearchParams();
    const [store, setStore] = useState(null);
    const [dishes, setDishes] = useState([]);
    const [comments, setComments] = useState([
        { id: '1', user: 'Sarah L.', text: 'Best burger in town! Fast delivery too.', rating: 5, date: '2h ago' },
        { id: '2', user: 'Mark M.', text: 'The pizza was a bit cold, but taste was great.', rating: 4, date: '5h ago' }
    ]);
    const [newComment, setNewComment] = useState('');
    const [activeTab, setActiveTab] = useState('grid'); // 'grid' or 'list' or 'reviews'
    const [loading, setLoading] = useState(true);
    const { addToCart, cartCount } = useContext(CartContext);
    const router = useRouter();

    useEffect(() => {
        fetchStoreData();
    }, [id]);

    const fetchStoreData = async () => {
        try {
            // New optimized endpoint
            const res = await axios.get(`${API.BUYER}/hotels/${id}`);
            setStore(res.data.hotel);
            setDishes(res.data.dishes);
        } catch (error) {
            console.error('Error fetching storefront data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddComment = () => {
        if (!newComment.trim()) return;
        const comment = {
            id: Date.now().toString(),
            user: 'Me',
            text: newComment,
            rating: 5,
            date: 'Just now'
        };
        setComments([comment, ...comments]);
        setNewComment('');
    };

    const renderHeader = () => (
        <View style={styles.profileHeader}>
            <View style={styles.brandingSection}>
                <View style={styles.logoContainer}>
                    <Image
                        source={{ uri: store.logo || store.image || 'https://via.placeholder.com/150' }}
                        style={styles.logo}
                    />
                </View>
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{dishes.length}</Text>
                        <Text style={styles.statLabel}>Products</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{store.rating?.toFixed(1) || '4.8'}</Text>
                        <Text style={styles.statLabel}>Rating</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{comments.length}</Text>
                        <Text style={styles.statLabel}>Reviews</Text>
                    </View>
                </View>
            </View>

            <View style={styles.bioSection}>
                <Text style={styles.storeName}>{store.name}</Text>
                <Text style={styles.categoryBadge}>{store.category || 'Premium Dining'}</Text>
                <Text style={styles.addressText} numberOfLines={2}>
                    📍 {store.address}
                </Text>
                <TouchableOpacity style={styles.followBtn}>
                    <Text style={styles.followBtnText}>Follow Store</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.tabBar}>
                <TouchableOpacity
                    style={[styles.tabItem, activeTab === 'grid' && styles.activeTab]}
                    onPress={() => setActiveTab('grid')}
                >
                    <Ionicons name="grid-outline" size={22} color={activeTab === 'grid' ? COLORS.primary : COLORS.textMuted} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabItem, activeTab === 'list' && styles.activeTab]}
                    onPress={() => setActiveTab('list')}
                >
                    <Ionicons name="list-outline" size={24} color={activeTab === 'list' ? COLORS.primary : COLORS.textMuted} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabItem, activeTab === 'reviews' && styles.activeTab]}
                    onPress={() => setActiveTab('reviews')}
                >
                    <Ionicons name="chatbubbles-outline" size={22} color={activeTab === 'reviews' ? COLORS.primary : COLORS.textMuted} />
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderDishGrid = ({ item }) => (
        <TouchableOpacity
            style={styles.gridCard}
            onPress={() => addToCart(item)}
            activeOpacity={0.8}
        >
            <Image source={{ uri: item.image || 'https://via.placeholder.com/300' }} style={styles.gridImage} />
            <View style={styles.gridOverlay}>
                <Text style={styles.gridPrice}>${item.price.toFixed(2)}</Text>
            </View>
            <View style={styles.gridInfo}>
                <Text style={styles.gridName} numberOfLines={1}>{item.name}</Text>
                <TouchableOpacity style={styles.gridAdd} onPress={() => addToCart(item)}>
                    <Ionicons name="add" size={16} color={COLORS.white} />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    const renderDishList = ({ item }) => (
        <View style={styles.listCard}>
            <View style={styles.listInfo}>
                <Text style={styles.listName}>{item.name}</Text>
                <Text style={styles.listDesc} numberOfLines={2}>{item.description}</Text>
                <Text style={styles.listPrice}>${item.price.toFixed(2)}</Text>
            </View>
            <View style={styles.listImageContainer}>
                <Image source={{ uri: item.image || 'https://via.placeholder.com/150' }} style={styles.listImage} />
                <TouchableOpacity style={styles.listAdd} onPress={() => addToCart(item)}>
                    <Ionicons name="add" size={20} color={COLORS.white} />
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderComment = ({ item }) => (
        <View style={styles.commentCard}>
            <View style={styles.commentHeader}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarChar}>{item.user[0]}</Text>
                </View>
                <View style={styles.commentMeta}>
                    <Text style={styles.commentUser}>{item.user}</Text>
                    <View style={styles.starRow}>
                        {[1, 2, 3, 4, 5].map(s => (
                            <Ionicons key={s} name="star" size={10} color={s <= item.rating ? "#F59E0B" : COLORS.border} />
                        ))}
                    </View>
                </View>
                <Text style={styles.commentDate}>{item.date}</Text>
            </View>
            <Text style={styles.commentText}>{item.text}</Text>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (!store) {
        return (
            <View style={styles.center}>
                <Ionicons name="storefront-outline" size={60} color={COLORS.border} />
                <Text style={{ fontSize: 18, color: COLORS.textMuted, marginTop: 16 }}>Store not found.</Text>
                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20, padding: 10 }}>
                    <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Top Navigation Bar */}
            <View style={styles.navBar}>
                <TouchableOpacity style={styles.navBtn} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={24} color={COLORS.secondary} />
                </TouchableOpacity>
                <Text style={styles.navTitle} numberOfLines={1}>{store?.name}</Text>
                <TouchableOpacity style={styles.navBtn} onPress={() => router.push('/(buyer)/cart')}>
                    <Ionicons name="cart-outline" size={24} color={COLORS.secondary} />
                    {cartCount > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{cartCount}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            <FlatList
                key={activeTab === 'grid' ? 'grid-view' : 'list-view'}
                data={activeTab === 'reviews' ? comments : dishes}
                numColumns={activeTab === 'grid' ? 2 : 1}
                keyExtractor={item => item._id || item.id}
                renderItem={activeTab === 'grid' ? renderDishGrid : (activeTab === 'list' ? renderDishList : renderComment)}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                columnWrapperStyle={activeTab === 'grid' ? styles.gridRow : null}
                ListFooterComponent={() => activeTab === 'reviews' && (
                    <View style={styles.footerInput}>
                        <TextInput
                            style={styles.input}
                            placeholder="Write a review..."
                            value={newComment}
                            onChangeText={setNewComment}
                        />
                        <TouchableOpacity style={styles.send} onPress={handleAddComment}>
                            <Ionicons name="send" size={20} color={COLORS.primary} />
                        </TouchableOpacity>
                    </View>
                )}
            />
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
    navBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.md,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    navBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    navTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.secondary,
        maxWidth: width * 0.5,
    },
    badge: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: COLORS.primary,
        width: 16,
        height: 16,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: 'bold',
    },
    scrollContent: {
        paddingBottom: 40,
    },
    profileHeader: {
        paddingTop: SPACING.lg,
    },
    brandingSection: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
    },
    logoContainer: {
        width: 86,
        height: 86,
        borderRadius: 43,
        padding: 3,
        borderWidth: 2,
        borderColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: '100%',
        height: '100%',
        borderRadius: 43,
    },
    statsRow: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginLeft: SPACING.lg,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.secondary,
    },
    statLabel: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginTop: 2,
    },
    bioSection: {
        paddingHorizontal: SPACING.lg,
        marginTop: SPACING.md,
    },
    storeName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.secondary,
    },
    categoryBadge: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.primary,
        marginTop: 2,
    },
    addressText: {
        fontSize: 13,
        color: COLORS.textMuted,
        marginTop: 6,
        lineHeight: 18,
    },
    followBtn: {
        backgroundColor: COLORS.primary,
        paddingVertical: 10,
        borderRadius: RADIUS.md,
        alignItems: 'center',
        marginTop: SPACING.lg,
    },
    followBtnText: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: 14,
    },
    tabBar: {
        flexDirection: 'row',
        marginTop: SPACING.xl,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: COLORS.primary,
    },
    gridRow: {
        paddingHorizontal: SPACING.lg,
        justifyContent: 'space-between',
        marginTop: 12,
    },
    gridCard: {
        width: COLUMN_WIDTH,
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.lg,
        overflow: 'hidden',
        ...SHADOWS.light,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    gridImage: {
        width: '100%',
        height: 140,
    },
    gridOverlay: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    gridPrice: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: 'bold',
    },
    gridInfo: {
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    gridName: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.secondary,
        flex: 1,
    },
    gridAdd: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 6,
    },
    listCard: {
        flexDirection: 'row',
        padding: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        alignItems: 'center',
    },
    listInfo: {
        flex: 1,
        marginRight: SPACING.md,
    },
    listName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.secondary,
    },
    listDesc: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginTop: 4,
        lineHeight: 16,
    },
    listPrice: {
        fontSize: 16,
        color: COLORS.primary,
        fontWeight: 'bold',
        marginTop: 8,
    },
    listImageContainer: {
        position: 'relative',
    },
    listImage: {
        width: 100,
        height: 100,
        borderRadius: RADIUS.md,
        backgroundColor: COLORS.background,
    },
    listAdd: {
        position: 'absolute',
        bottom: -5,
        right: -5,
        backgroundColor: COLORS.secondary,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.light,
    },
    commentCard: {
        padding: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    commentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    avatarChar: {
        color: COLORS.white,
        fontWeight: 'bold',
    },
    commentMeta: {
        flex: 1,
    },
    commentUser: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.secondary,
    },
    starRow: {
        flexDirection: 'row',
        marginTop: 2,
    },
    commentDate: {
        fontSize: 12,
        color: COLORS.textMuted,
    },
    commentText: {
        fontSize: 14,
        color: COLORS.textMuted,
        lineHeight: 20,
    },
    footerInput: {
        flexDirection: 'row',
        padding: SPACING.lg,
        alignItems: 'center',
        backgroundColor: COLORS.background,
        margin: SPACING.lg,
        borderRadius: RADIUS.lg,
    },
    input: {
        flex: 1,
        fontSize: 14,
        color: COLORS.secondary,
    },
    send: {
        marginLeft: 12,
    }
});

export default StorefrontScreen;
