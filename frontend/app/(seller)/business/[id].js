import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, FlatList, StyleSheet, TouchableOpacity, Image,
    ActivityIndicator, Alert, Modal, TextInput, ScrollView, Dimensions
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import API from '../../../constants/api';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

const BusinessDetailScreen = () => {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const [business, setBusiness] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [saving, setSaving] = useState(false);

    // Edit / Delete state
    const [editItem, setEditItem] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', description: '', price: '', image: '' });
    const [updating, setUpdating] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        image: '',
        hotelId: id,
    });

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [id])
    );

    const fetchData = async () => {
        try {
            const [hotelsRes, dishesRes] = await Promise.all([
                axios.get(`${API.SELLER}/hotels`),
                axios.get(`${API.SELLER}/dishes`),
            ]);
            const found = hotelsRes.data.find(h => h._id === id);
            setBusiness(found || null);
            const filtered = dishesRes.data.filter(d => d.hotelId === id);
            setProducts(filtered);
        } catch (err) {
            console.error('BusinessDetail fetch error:', err);
            Alert.alert('Error', 'Could not load business data.');
        } finally {
            setLoading(false);
        }
    };

    const pickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Gallery access is required.');
                return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: 'images',
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.7,
                base64: true,
            });
            if (!result.canceled && result.assets?.length > 0) {
                setFormData(prev => ({ ...prev, image: `data:image/jpeg;base64,${result.assets[0].base64}` }));
            }
        } catch (err) {
            console.error('pickImage error:', err);
        }
    };

    const handleAddProduct = async () => {
        if (!formData.name || !formData.price || !formData.description) {
            Alert.alert('Missing Fields', 'Please fill in all required fields.');
            return;
        }
        setSaving(true);
        try {
            await axios.post(`${API.SELLER}/dishes`, {
                ...formData,
                hotelId: id,
                price: parseFloat(formData.price),
            });
            setModalVisible(false);
            setFormData({ name: '', description: '', price: '', image: '', hotelId: id });
            fetchData();
            Alert.alert('Success', 'Product added successfully!');
        } catch (err) {
            console.error('Add product error:', err);
            const msg = err.response?.data?.message || 'Failed to add product.';
            Alert.alert('Error', msg);
        } finally {
            setSaving(false);
        }
    };

    // ── Edit / Delete handlers ──
    const openEdit = (item) => {
        setEditItem(item);
        setEditForm({ name: item.name, description: item.description, price: String(item.price), image: item.image || '' });
    };

    const pickEditImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') return;
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: 'images', allowsEditing: true, aspect: [4, 3], quality: 0.7, base64: true,
            });
            if (!result.canceled && result.assets?.length > 0) {
                setEditForm(p => ({ ...p, image: `data:image/jpeg;base64,${result.assets[0].base64}` }));
            }
        } catch (e) { console.error(e); }
    };

    const handleUpdateDish = async () => {
        if (!editForm.name || !editForm.price || !editForm.description) {
            Alert.alert('Missing Fields', 'Please fill in all required fields.');
            return;
        }
        setUpdating(true);
        try {
            await axios.put(`${API.SELLER}/dishes/${editItem._id}`, { ...editForm, price: parseFloat(editForm.price) });
            setEditItem(null);
            fetchData();
            Alert.alert('Saved', 'Product updated!');
        } catch (err) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to update.');
        } finally { setUpdating(false); }
    };

    const handleDeleteDish = () => {
        Alert.alert('Delete Product', `Permanently delete "${editItem?.name}"?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: async () => {
                    setDeleting(true);
                    try {
                        await axios.delete(`${API.SELLER}/dishes/${editItem._id}`);
                        setEditItem(null);
                        fetchData();
                        Alert.alert('Deleted', 'Product removed.');
                    } catch (err) {
                        Alert.alert('Error', err.response?.data?.message || 'Failed to delete.');
                    } finally { setDeleting(false); }
                }
            }
        ]);
    };

    const renderProduct = ({ item }) => (
        <View style={styles.productCard}>
            <Image
                source={{ uri: item.image || 'https://via.placeholder.com/150' }}
                style={styles.productImage}
            />
            <View style={styles.productInfo}>
                <View style={styles.productHeader}>
                    <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
                </View>
                <Text style={styles.productDesc} numberOfLines={2}>{item.description}</Text>
                <View style={styles.productFooter}>
                    <View style={styles.stockBadge}>
                        <Ionicons name="checkmark-circle" size={12} color={COLORS.primary} />
                        <Text style={styles.stockText}>In Stock</Text>
                    </View>
                    <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
                        <Ionicons name="create-outline" size={18} color={COLORS.secondary} />
                    </TouchableOpacity>
                </View>
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
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={24} color={COLORS.secondary} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle} numberOfLines={1}>
                        {business?.name || 'Business'}
                    </Text>
                    <Text style={styles.headerSub}>{products.length} products</Text>
                </View>
                <TouchableOpacity
                    style={styles.addBtnHeader}
                    onPress={() => setModalVisible(true)}
                >
                    <Ionicons name="add" size={22} color={COLORS.white} />
                    <Text style={styles.addBtnText}>Add</Text>
                </TouchableOpacity>
            </View>

            {/* Business banner */}
            {business?.image && (
                <Image source={{ uri: business.image }} style={styles.bannerImage} />
            )}

            {/* Business meta info */}
            <View style={styles.metaRow}>
                {business?.category ? (
                    <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>{business.category}</Text>
                    </View>
                ) : null}
                {business?.address ? (
                    <Text style={styles.addressText} numberOfLines={1}>
                        <Ionicons name="location-outline" size={12} color={COLORS.textMuted} /> {business.address}
                    </Text>
                ) : null}
            </View>

            {/* Products list */}
            <FlatList
                data={products}
                keyExtractor={item => item._id}
                renderItem={renderProduct}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="cube-outline" size={70} color={COLORS.border} />
                        <Text style={styles.emptyTitle}>No products yet</Text>
                        <Text style={styles.emptySubtitle}>Tap "Add" to list your first product for this business.</Text>
                        <TouchableOpacity style={styles.emptyAddBtn} onPress={() => setModalVisible(true)}>
                            <Ionicons name="add-circle-outline" size={18} color={COLORS.white} style={{ marginRight: 6 }} />
                            <Text style={styles.emptyAddText}>Add First Product</Text>
                        </TouchableOpacity>
                    </View>
                }
            />

            {/* Floating Add Button */}
            <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
                <Ionicons name="add" size={30} color={COLORS.white} />
            </TouchableOpacity>

            {/* Add Product Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Add Product</Text>
                            <Text style={styles.modalSub}>to {business?.name}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color={COLORS.secondary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* Image Upload */}
                            <TouchableOpacity style={styles.imageUpload} onPress={pickImage}>
                                {formData.image ? (
                                    <Image source={{ uri: formData.image }} style={styles.uploadedImage} />
                                ) : (
                                    <>
                                        <Ionicons name="camera-outline" size={36} color={COLORS.textMuted} />
                                        <Text style={styles.uploadLabel}>Upload Product Photo</Text>
                                    </>
                                )}
                            </TouchableOpacity>

                            {/* Product Name */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Product Name *</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.name}
                                    onChangeText={t => setFormData(p => ({ ...p, name: t }))}
                                    placeholder="e.g. Artisan Coffee Blend"
                                    placeholderTextColor={COLORS.textMuted}
                                />
                            </View>

                            {/* Price */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Price ($) *</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.price}
                                    onChangeText={t => setFormData(p => ({ ...p, price: t }))}
                                    placeholder="0.00"
                                    keyboardType="numeric"
                                    placeholderTextColor={COLORS.textMuted}
                                />
                            </View>

                            {/* Description */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Description *</Text>
                                <TextInput
                                    style={[styles.input, { height: 90 }]}
                                    value={formData.description}
                                    onChangeText={t => setFormData(p => ({ ...p, description: t }))}
                                    placeholder="Tell customers about this product..."
                                    placeholderTextColor={COLORS.textMuted}
                                    multiline
                                />
                            </View>

                            <TouchableOpacity
                                style={[styles.createBtn, saving && styles.disabledBtn]}
                                onPress={handleAddProduct}
                                disabled={saving}
                            >
                                {saving ? (
                                    <ActivityIndicator color={COLORS.white} />
                                ) : (
                                    <Text style={styles.createBtnText}>Add to {business?.name}</Text>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* ── Edit / Delete Modal ── */}
            <Modal animationType="slide" transparent={true} visible={!!editItem} onRequestClose={() => setEditItem(null)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={styles.modalTitle}>Edit Product</Text>
                                <Text style={styles.modalSub}>{editItem?.name}</Text>
                            </View>
                            <TouchableOpacity onPress={() => setEditItem(null)}>
                                <Ionicons name="close" size={24} color={COLORS.secondary} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <TouchableOpacity style={styles.imageUpload} onPress={pickEditImage}>
                                {editForm.image ? (
                                    <Image source={{ uri: editForm.image }} style={styles.uploadedImage} />
                                ) : (<><Ionicons name="camera-outline" size={36} color={COLORS.textMuted} /><Text style={styles.uploadLabel}>Change Photo</Text></>)}
                            </TouchableOpacity>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Product Name</Text>
                                <TextInput style={styles.input} value={editForm.name} onChangeText={t => setEditForm(p => ({ ...p, name: t }))} placeholderTextColor={COLORS.textMuted} />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Price ($)</Text>
                                <TextInput style={styles.input} value={editForm.price} onChangeText={t => setEditForm(p => ({ ...p, price: t }))} keyboardType="numeric" placeholderTextColor={COLORS.textMuted} />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Description</Text>
                                <TextInput style={[styles.input, { height: 80 }]} value={editForm.description} onChangeText={t => setEditForm(p => ({ ...p, description: t }))} multiline placeholderTextColor={COLORS.textMuted} />
                            </View>
                            <TouchableOpacity style={[styles.createBtn, updating && styles.disabledBtn]} onPress={handleUpdateDish} disabled={updating}>
                                {updating ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.createBtnText}>Save Changes</Text>}
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.deleteBtn, deleting && styles.disabledBtn]} onPress={handleDeleteDish} disabled={deleting}>
                                {deleting ? <ActivityIndicator color="#EF4444" /> : (<><Ionicons name="trash-outline" size={18} color="#EF4444" style={{ marginRight: 6 }} /><Text style={styles.deleteBtnText}>Delete Product</Text></>)}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.white },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 55,
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.md,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: COLORS.background,
        justifyContent: 'center', alignItems: 'center',
    },
    headerCenter: {
        flex: 1,
        marginHorizontal: SPACING.md,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.secondary,
    },
    headerSub: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginTop: 2,
    },
    addBtnHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        paddingHorizontal: 14,
        paddingVertical: 9,
        borderRadius: RADIUS.round,
        ...SHADOWS.light,
    },
    addBtnText: {
        color: COLORS.white,
        fontWeight: '800',
        marginLeft: 4,
        fontSize: 13,
    },
    bannerImage: {
        width: '100%',
        height: 160,
        backgroundColor: COLORS.background,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        gap: 12,
    },
    categoryBadge: {
        backgroundColor: COLORS.background,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: RADIUS.sm,
    },
    categoryText: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.primary,
    },
    addressText: {
        fontSize: 12,
        color: COLORS.textMuted,
        flex: 1,
    },
    listContainer: {
        padding: SPACING.lg,
        paddingBottom: 120,
    },
    productCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.lg,
        padding: 12,
        marginBottom: 16,
        ...SHADOWS.light,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    productImage: {
        width: 90,
        height: 90,
        borderRadius: RADIUS.md,
        backgroundColor: COLORS.background,
    },
    productInfo: {
        flex: 1,
        marginLeft: 14,
        justifyContent: 'space-between',
    },
    productHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    productName: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.secondary,
        flex: 1,
        marginRight: 6,
    },
    productPrice: {
        fontSize: 15,
        fontWeight: '800',
        color: COLORS.primary,
    },
    productDesc: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginTop: 4,
        lineHeight: 16,
    },
    productFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    stockBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    stockText: {
        fontSize: 11,
        color: COLORS.primary,
        fontWeight: '600',
    },
    editBtn: {
        width: 30, height: 30, borderRadius: 15,
        backgroundColor: COLORS.background,
        justifyContent: 'center', alignItems: 'center',
    },
    emptyContainer: {
        marginTop: 60,
        alignItems: 'center',
        paddingHorizontal: SPACING.xl,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.secondary,
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: 13,
        color: COLORS.textMuted,
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 20,
    },
    emptyAddBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: RADIUS.round,
        marginTop: 24,
        ...SHADOWS.light,
    },
    emptyAddText: {
        color: COLORS.white,
        fontWeight: '700',
        fontSize: 14,
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.medium,
        elevation: 6,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: RADIUS.xl,
        borderTopRightRadius: RADIUS.xl,
        padding: SPACING.lg,
        maxHeight: '92%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SPACING.xl,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.secondary,
    },
    modalSub: {
        fontSize: 13,
        color: COLORS.textMuted,
        marginTop: 2,
        flex: 1,
        marginLeft: 4,
    },
    imageUpload: {
        width: '100%',
        height: 160,
        backgroundColor: COLORS.background,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.xl,
        overflow: 'hidden',
    },
    uploadedImage: { width: '100%', height: '100%' },
    uploadLabel: {
        fontSize: 13,
        color: COLORS.textMuted,
        fontWeight: '600',
        marginTop: 8,
    },
    inputGroup: { marginBottom: SPACING.lg },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.secondary,
        marginBottom: 8,
    },
    input: {
        backgroundColor: COLORS.background,
        borderRadius: RADIUS.md,
        padding: 14,
        fontSize: 15,
        color: COLORS.secondary,
        borderWidth: 1,
        borderColor: COLORS.border,
        textAlignVertical: 'top',
    },
    createBtn: {
        backgroundColor: COLORS.primary,
        height: 56,
        borderRadius: RADIUS.lg,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: SPACING.xl,
        ...SHADOWS.medium,
    },
    createBtnText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '800',
    },
    disabledBtn: { opacity: 0.7 },
    deleteBtn: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: 52,
        borderRadius: RADIUS.lg,
        borderWidth: 1.5,
        borderColor: '#EF4444',
        marginBottom: SPACING.xxl,
    },
    deleteBtnText: {
        color: '#EF4444',
        fontSize: 15,
        fontWeight: '700',
    },
});

export default BusinessDetailScreen;
