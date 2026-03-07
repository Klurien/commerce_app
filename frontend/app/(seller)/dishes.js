import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert, Modal, TextInput, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import API from '../../constants/api';
import { AuthContext } from '../../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

const ManageDishesScreen = () => {
    const router = useRouter();
    const { user } = useContext(AuthContext);
    const [dishes, setDishes] = useState([]);
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [saving, setSaving] = useState(false);
    const [selectedHotel, setSelectedHotel] = useState('All');

    // Edit / Delete state
    const [editItem, setEditItem] = useState(null);   // the dish being edited
    const [editForm, setEditForm] = useState({ name: '', description: '', price: '', image: '' });
    const [updating, setUpdating] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        hotelId: '',
        image: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [dishesRes, hotelsRes] = await Promise.all([
                axios.get(`${API.SELLER}/dishes`),
                axios.get(`${API.SELLER}/hotels`)
            ]);
            setDishes(dishesRes.data);
            setHotels(hotelsRes.data);
            if (hotelsRes.data.length > 0) {
                setFormData(prev => ({ ...prev, hotelId: hotelsRes.data[0]._id }));
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const pickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Gallery access is required to upload food photos.');
                return;
            }

            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: 'images',
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.7,
                base64: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setFormData({ ...formData, image: `data:image/jpeg;base64,${result.assets[0].base64}` });
            }
        } catch (error) {
            console.error('PickImage Error:', error);
        }
    };

    const handleCreateDish = async () => {
        if (!formData.name || !formData.price || !formData.description) {
            Alert.alert("Missing Fields", "Please fill in all required information.");
            return;
        }

        if (hotels.length === 0) {
            Alert.alert(
                "No Business Found",
                "You must set up your Official Profile (Business) before adding products.",
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Go to Profile", onPress: () => router.push('/(seller)/profile') }
                ]
            );
            return;
        }

        setSaving(true);
        try {
            await axios.post(`${API.SELLER}/dishes`, {
                ...formData,
                price: parseFloat(formData.price)
            });

            setModalVisible(false);
            setFormData({ name: '', description: '', price: '', hotelId: hotels[0]?._id, image: '' });
            fetchData();
            Alert.alert("Success", "Product added successfully!");
        } catch (error) {
            console.error('Create product error:', error);
            const msg = error.response?.data?.message || "Failed to add product.";
            Alert.alert("Error", msg);
        } finally {
            setSaving(false);
        }
    };

    // ── Edit / Delete handlers ──────────────────────────────────────────────
    const openEdit = (item) => {
        setEditItem(item);
        setEditForm({
            name: item.name,
            description: item.description,
            price: String(item.price),
            image: item.image || '',
        });
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
            await axios.put(`${API.SELLER}/dishes/${editItem._id}`, {
                ...editForm,
                price: parseFloat(editForm.price),
            });
            setEditItem(null);
            fetchData();
            Alert.alert('Saved', 'Product updated successfully!');
        } catch (err) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to update.');
        } finally {
            setUpdating(false);
        }
    };

    const handleDeleteDish = () => {
        Alert.alert(
            'Delete Product',
            `Are you sure you want to permanently delete "${editItem?.name}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete', style: 'destructive',
                    onPress: async () => {
                        setDeleting(true);
                        try {
                            await axios.delete(`${API.SELLER}/dishes/${editItem._id}`);
                            setEditItem(null);
                            fetchData();
                            Alert.alert('Deleted', 'Product removed successfully.');
                        } catch (err) {
                            Alert.alert('Error', err.response?.data?.message || 'Failed to delete.');
                        } finally {
                            setDeleting(false);
                        }
                    }
                }
            ]
        );
    };

    const filteredDishes = selectedHotel === 'All'
        ? dishes
        : dishes.filter(d => d.hotelId === selectedHotel);

    const renderDishItem = ({ item }) => (
        <View style={styles.dishCard}>
            <Image
                source={{ uri: item.image || 'https://via.placeholder.com/150' }}
                style={styles.dishImage}
            />
            <View style={styles.dishInfo}>
                <View style={styles.dishHeader}>
                    <Text style={styles.dishName}>{item.name}</Text>
                    <Text style={styles.dishPrice}>${item.price.toFixed(2)}</Text>
                </View>
                <Text style={styles.dishDesc} numberOfLines={2}>{item.description}</Text>
                <View style={styles.dishFooter}>
                    <TouchableOpacity
                        style={styles.tag}
                        onPress={() => item.hotelId && router.push(`/(seller)/business/${item.hotelId}`)}
                    >
                        <Ionicons name="business-outline" size={10} color={COLORS.primary} style={{ marginRight: 3 }} />
                        <Text style={[styles.tagText, { color: COLORS.primary }]}>
                            {hotels.find(h => h._id === item.hotelId)?.name || 'General Catalog'}
                        </Text>
                    </TouchableOpacity>
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
            <View style={styles.screenHeader}>
                <View>
                    <Text style={styles.title}>Product Catalog</Text>
                    <Text style={styles.subtitle}>Showing {filteredDishes.length} products</Text>
                </View>
                <TouchableOpacity style={styles.addBtnHeader} onPress={() => setModalVisible(true)}>
                    <Ionicons name="add" size={24} color={COLORS.white} />
                    <Text style={styles.addBtnHeaderText}>Add New</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.filterContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                    <TouchableOpacity
                        style={[styles.filterPill, selectedHotel === 'All' && styles.filterPillActive]}
                        onPress={() => setSelectedHotel('All')}
                    >
                        <Text style={[styles.filterPillText, selectedHotel === 'All' && styles.filterPillTextActive]}>All Businesses</Text>
                    </TouchableOpacity>
                    {hotels.map(hotel => (
                        <TouchableOpacity
                            key={hotel._id}
                            style={[styles.filterPill, selectedHotel === hotel._id && styles.filterPillActive]}
                            onPress={() => setSelectedHotel(hotel._id)}
                        >
                            <Text style={[styles.filterPillText, selectedHotel === hotel._id && styles.filterPillTextActive]}>
                                {hotel.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <FlatList
                data={filteredDishes}
                keyExtractor={(item) => item._id}
                renderItem={renderDishItem}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="cube-outline" size={80} color={COLORS.border} />
                        <Text style={styles.emptyText}>Your catalog is currently empty.</Text>
                    </View>
                }
            />

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Add New Product</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color={COLORS.secondary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <TouchableOpacity style={styles.imageUpload} onPress={pickImage}>
                                {formData.image ? (
                                    <Image source={{ uri: formData.image }} style={styles.uploadedImage} />
                                ) : (
                                    <>
                                        <Ionicons name="camera-outline" size={40} color={COLORS.textMuted} />
                                        <Text style={styles.uploadLabel}>Upload Product Photo</Text>
                                    </>
                                )}
                            </TouchableOpacity>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Product Name</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.name}
                                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                                    placeholder="e.g. Handmade Ceramic Mug"
                                />
                            </View>

                            <View style={[styles.inputGroup, { flexDirection: 'row', justifyContent: 'space-between' }]}>
                                <View style={{ width: '48%' }}>
                                    <Text style={styles.label}>Price ($)</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={formData.price}
                                        onChangeText={(text) => setFormData({ ...formData, price: text })}
                                        placeholder="0.00"
                                        keyboardType="numeric"
                                    />
                                </View>
                                <View style={{ width: '48%' }}>
                                    <Text style={styles.label}>Availability</Text>
                                    <View style={styles.staticInput}>
                                        <Text style={styles.staticText}>Instock</Text>
                                        <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />
                                    </View>
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Description</Text>
                                <TextInput
                                    style={[styles.input, { height: 80 }]}
                                    value={formData.description}
                                    onChangeText={(text) => setFormData({ ...formData, description: text })}
                                    placeholder="Tell customers about this product..."
                                    multiline
                                />
                            </View>

                            <TouchableOpacity
                                style={[styles.createBtn, saving && styles.disabledBtn]}
                                onPress={handleCreateDish}
                                disabled={saving}
                            >
                                {saving ? (
                                    <ActivityIndicator color={COLORS.white} />
                                ) : (
                                    <Text style={styles.createBtnText}>Add Product to Catalog</Text>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* ── Edit / Delete Modal ── */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={!!editItem}
                onRequestClose={() => setEditItem(null)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {/* Header */}
                        <View style={styles.editModalHeader}>
                            <View>
                                <Text style={styles.modalTitle}>Edit Product</Text>
                                <Text style={styles.editModalSub}>{editItem?.name}</Text>
                            </View>
                            <TouchableOpacity onPress={() => setEditItem(null)}>
                                <Ionicons name="close" size={24} color={COLORS.secondary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* Image */}
                            <TouchableOpacity style={styles.imageUpload} onPress={pickEditImage}>
                                {editForm.image ? (
                                    <Image source={{ uri: editForm.image }} style={styles.uploadedImage} />
                                ) : (
                                    <>
                                        <Ionicons name="camera-outline" size={36} color={COLORS.textMuted} />
                                        <Text style={styles.uploadLabel}>Change Photo</Text>
                                    </>
                                )}
                            </TouchableOpacity>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Product Name</Text>
                                <TextInput
                                    style={styles.input}
                                    value={editForm.name}
                                    onChangeText={t => setEditForm(p => ({ ...p, name: t }))}
                                    placeholderTextColor={COLORS.textMuted}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Price ($)</Text>
                                <TextInput
                                    style={styles.input}
                                    value={editForm.price}
                                    onChangeText={t => setEditForm(p => ({ ...p, price: t }))}
                                    keyboardType="numeric"
                                    placeholderTextColor={COLORS.textMuted}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Description</Text>
                                <TextInput
                                    style={[styles.input, { height: 80 }]}
                                    value={editForm.description}
                                    onChangeText={t => setEditForm(p => ({ ...p, description: t }))}
                                    multiline
                                    placeholderTextColor={COLORS.textMuted}
                                />
                            </View>

                            {/* Save */}
                            <TouchableOpacity
                                style={[styles.createBtn, updating && styles.disabledBtn]}
                                onPress={handleUpdateDish}
                                disabled={updating}
                            >
                                {updating
                                    ? <ActivityIndicator color={COLORS.white} />
                                    : <Text style={styles.createBtnText}>Save Changes</Text>
                                }
                            </TouchableOpacity>

                            {/* Delete */}
                            <TouchableOpacity
                                style={[styles.deleteBtn, deleting && styles.disabledBtn]}
                                onPress={handleDeleteDish}
                                disabled={deleting}
                            >
                                {deleting
                                    ? <ActivityIndicator color="#EF4444" />
                                    : (
                                        <>
                                            <Ionicons name="trash-outline" size={18} color="#EF4444" style={{ marginRight: 6 }} />
                                            <Text style={styles.deleteBtnText}>Delete Product</Text>
                                        </>
                                    )
                                }
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
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
    screenHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingTop: 60,
        paddingBottom: SPACING.lg,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.secondary,
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.textMuted,
        marginTop: 4,
    },
    addBtnHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: RADIUS.round,
        ...SHADOWS.light,
    },
    addBtnHeaderText: {
        color: COLORS.white,
        fontWeight: '800',
        marginLeft: 4,
        fontSize: 12,
    },
    filterContainer: {
        paddingBottom: SPACING.md,
    },
    filterScroll: {
        paddingHorizontal: SPACING.lg,
    },
    filterPill: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: RADIUS.round,
        backgroundColor: COLORS.background,
        marginRight: 10,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    filterPillActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    filterPillText: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.textMuted,
    },
    filterPillTextActive: {
        color: COLORS.white,
    },
    listContainer: {
        padding: SPACING.lg,
        paddingBottom: 40,
    },
    dishCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.lg,
        padding: 12,
        marginBottom: 16,
        ...SHADOWS.light,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    dishImage: {
        width: 100,
        height: 100,
        borderRadius: RADIUS.md,
    },
    dishInfo: {
        flex: 1,
        marginLeft: 14,
        justifyContent: 'space-between',
    },
    dishHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    dishName: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.secondary,
        flex: 1,
        marginRight: 6,
    },
    dishPrice: {
        fontSize: 15,
        fontWeight: '800',
        color: COLORS.primary,
    },
    dishDesc: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginTop: 4,
        lineHeight: 16,
    },
    dishFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    tagText: {
        fontSize: 10,
        color: COLORS.textMuted,
        fontWeight: '600',
    },
    editBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        marginTop: 100,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: COLORS.textMuted,
        marginTop: 16,
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
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.secondary,
    },
    imageUpload: {
        width: '100%',
        height: 180,
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
    uploadedImage: {
        width: '100%',
        height: '100%',
    },
    uploadLabel: {
        fontSize: 13,
        color: COLORS.textMuted,
        fontWeight: '600',
        marginTop: 8,
    },
    inputGroup: {
        marginBottom: SPACING.lg,
    },
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
    },
    staticInput: {
        backgroundColor: COLORS.background,
        borderRadius: RADIUS.md,
        padding: 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    staticText: {
        fontSize: 15,
        color: COLORS.textMuted,
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
        fontWeight: 'bold',
    },
    disabledBtn: {
        opacity: 0.7,
    },
    editModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SPACING.xl,
    },
    editModalSub: {
        fontSize: 13,
        color: COLORS.textMuted,
        marginTop: 2,
    },
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
})

export default ManageDishesScreen;
