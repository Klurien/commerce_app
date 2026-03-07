import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Alert, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';
import API from '../../../constants/api';
import { AuthContext } from '../../../context/AuthContext';
import { CartContext } from '../../../context/CartContext';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const DishDetailScreen = () => {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { user } = useContext(AuthContext);
    const { addToCart } = useContext(CartContext);

    const [loading, setLoading] = useState(true);
    const [dish, setDish] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [userRating, setUserRating] = useState(5);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchDetails();
    }, [id]);

    const fetchDetails = async () => {
        try {
            const { data } = await axios.get(`${API.BUYER}/dishes/${id}`);
            setDish(data.dish);
            setComments(data.comments);
        } catch (error) {
            console.error('Error fetching dish details:', error);
            Alert.alert("Error", "Could not load dish details.");
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;
        setSubmitting(true);
        try {
            const { data } = await axios.post(`${API.BUYER}/dishes/${id}/comments`, {
                text: newComment,
                rating: userRating
            });
            setComments([data, ...comments]);
            setNewComment('');
            setUserRating(5);
            Alert.alert("Success", "Review posted! 🌟");
        } catch (error) {
            console.error('Error adding comment:', error);
            Alert.alert("Error", "Failed to post review. Are you logged in?");
        } finally {
            setSubmitting(false);
        }
    };

    const renderStars = (rating, size = 16) => {
        return (
            <View style={styles.starRow}>
                {[1, 2, 3, 4, 5].map(star => (
                    <Ionicons
                        key={star}
                        name={star <= rating ? "star" : "star-outline"}
                        size={size}
                        color={star <= rating ? "#F59E0B" : COLORS.border}
                    />
                ))}
            </View>
        );
    };

    const handleRatingPress = (rating) => {
        setUserRating(rating);
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (!dish) return null;

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={100}
        >
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Hero Header */}
                <View style={styles.heroSection}>
                    <Image source={{ uri: dish.image || 'https://via.placeholder.com/600x400' }} style={styles.heroImage} />
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.secondary} />
                    </TouchableOpacity>

                    {/* Business Badge overlap */}
                    <TouchableOpacity
                        style={styles.businessBadge}
                        onPress={() => {
                            if (dish.hotelId?._id) {
                                router.push(`/(buyer)/store/${dish.hotelId._id}`);
                            } else {
                                Alert.alert("Notice", "Official store profile is not available for this item.");
                            }
                        }}
                    >
                        <View style={styles.businessAvatar}>
                            {dish.hotelId?.logo ? (
                                <Image source={{ uri: dish.hotelId.logo }} style={styles.avatarImg} />
                            ) : (
                                <Ionicons name="business" size={16} color={COLORS.textMuted} />
                            )}
                        </View>
                        <Text style={styles.businessName} numberOfLines={1}>{dish.hotelId?.name || 'Seller'}</Text>
                        <Ionicons name="chevron-forward" size={12} color={COLORS.textMuted} />
                    </TouchableOpacity>
                </View>

                <View style={styles.content}>
                    <View style={styles.infoRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.dishName}>{dish.name}</Text>
                            <View style={styles.metaRow}>
                                {renderStars(4.5, 14)}
                                <Text style={styles.metaText}> (120+ reviews)</Text>
                            </View>
                        </View>
                        <Text style={styles.priceText}>${dish.price?.toFixed(2)}</Text>
                    </View>

                    <Text style={styles.description}>{dish.description}</Text>

                    <TouchableOpacity style={styles.addToCartBtn} onPress={() => addToCart(dish)}>
                        <Ionicons name="cart-outline" size={20} color={COLORS.white} style={{ marginRight: 8 }} />
                        <Text style={styles.addToCartText}>Add to Order</Text>
                    </TouchableOpacity>

                    {/* Social Section */}
                    <View style={styles.divider} />

                    <Text style={styles.sectionTitle}>What foodies say</Text>

                    {/* Write Review */}
                    <View style={styles.reviewBox}>
                        <Text style={styles.reviewLabel}>Rate this product</Text>
                        <View style={styles.interactiveStars}>
                            {[1, 2, 3, 4, 5].map(star => (
                                <TouchableOpacity key={star} onPress={() => handleRatingPress(star)}>
                                    <Ionicons
                                        name={star <= userRating ? "star" : "star-outline"}
                                        size={32}
                                        color={star <= userRating ? "#F59E0B" : COLORS.border}
                                        style={{ marginRight: 5 }}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>
                        <TextInput
                            style={styles.reviewInput}
                            placeholder="Tell others about your experience..."
                            placeholderTextColor={COLORS.textMuted}
                            value={newComment}
                            onChangeText={setNewComment}
                            multiline
                        />
                        <TouchableOpacity
                            style={[styles.postBtn, submitting && styles.disabledBtn]}
                            onPress={handleAddComment}
                            disabled={submitting}
                        >
                            {submitting ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.postBtnText}>Post Experience</Text>}
                        </TouchableOpacity>
                    </View>

                    {/* Comments List */}
                    <View style={styles.commentsList}>
                        {comments.length === 0 ? (
                            <View style={styles.noComments}>
                                <Ionicons name="chatbox-outline" size={40} color={COLORS.border} />
                                <Text style={styles.noCommentsText}>Be the first to review!</Text>
                            </View>
                        ) : (
                            comments.map((comment, index) => (
                                <View key={index} style={styles.commentCard}>
                                    <View style={styles.commentHeader}>
                                        <Text style={styles.commentUser}>{comment.userId?.name || 'Anonymous'}</Text>
                                        <Text style={styles.commentDate}>{new Date(comment.createdAt).toLocaleDateString()}</Text>
                                    </View>
                                    {renderStars(comment.rating)}
                                    <Text style={styles.commentText}>{comment.text}</Text>
                                </View>
                            ))
                        )}
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
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
    heroSection: {
        width: '100%',
        height: 350,
        position: 'relative',
    },
    heroImage: {
        width: '100%',
        height: '100%',
        backgroundColor: COLORS.background,
    },
    backBtn: {
        position: 'absolute',
        top: 50,
        left: 20,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.medium,
    },
    businessBadge: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: COLORS.white,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        paddingRight: 12,
        borderRadius: RADIUS.round,
        ...SHADOWS.medium,
        maxWidth: width * 0.6,
    },
    businessAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
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
    businessName: {
        fontSize: 14,
        fontWeight: '800',
        color: COLORS.secondary,
        marginRight: 6,
    },
    content: {
        padding: SPACING.lg,
        borderTopLeftRadius: RADIUS.xl,
        borderTopRightRadius: RADIUS.xl,
        backgroundColor: COLORS.white,
        marginTop: -30,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SPACING.md,
    },
    dishName: {
        fontSize: 26,
        fontWeight: '900',
        color: COLORS.secondary,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    starRow: {
        flexDirection: 'row',
    },
    metaText: {
        fontSize: 12,
        color: COLORS.textMuted,
        fontWeight: '600',
    },
    priceText: {
        fontSize: 24,
        fontWeight: '900',
        color: COLORS.primary,
    },
    description: {
        fontSize: 15,
        color: COLORS.textMuted,
        lineHeight: 22,
        marginBottom: SPACING.xl,
    },
    addToCartBtn: {
        backgroundColor: COLORS.primary,
        height: 60,
        borderRadius: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.xxl,
        ...SHADOWS.medium,
    },
    addToCartText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: '800',
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginBottom: SPACING.xl,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: COLORS.secondary,
        marginBottom: SPACING.lg,
    },
    reviewBox: {
        backgroundColor: COLORS.background,
        borderRadius: RADIUS.xl,
        padding: SPACING.lg,
        marginBottom: SPACING.xxl,
    },
    reviewLabel: {
        fontSize: 14,
        fontWeight: '800',
        color: COLORS.secondary,
        marginBottom: 10,
    },
    interactiveStars: {
        flexDirection: 'row',
        marginBottom: SPACING.md,
    },
    reviewInput: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.lg,
        padding: 15,
        height: 100,
        fontSize: 14,
        color: COLORS.secondary,
        textAlignVertical: 'top',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    postBtn: {
        backgroundColor: COLORS.secondary,
        height: 50,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: SPACING.md,
    },
    postBtnText: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: 15,
    },
    disabledBtn: {
        opacity: 0.7,
    },
    commentsList: {
        paddingBottom: 40,
    },
    commentCard: {
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        paddingBottom: 15,
    },
    commentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    commentUser: {
        fontWeight: '800',
        color: COLORS.secondary,
        fontSize: 14,
    },
    commentDate: {
        fontSize: 12,
        color: COLORS.textMuted,
    },
    commentText: {
        fontSize: 14,
        color: COLORS.secondary,
        marginTop: 8,
        lineHeight: 20,
    },
    noComments: {
        alignItems: 'center',
        marginTop: 20,
    },
    noCommentsText: {
        color: COLORS.textMuted,
        marginTop: 10,
        fontSize: 14,
        fontWeight: '600',
    },
});

export default DishDetailScreen;
