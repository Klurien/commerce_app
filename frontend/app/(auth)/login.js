import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

const LoginScreen = () => {
    const [email, setEmail] = useState('admin@email.com');
    const [password, setPassword] = useState('123456');
    const { login, loginWithGoogle, error, isLoading } = useContext(AuthContext);
    const router = useRouter();

    const handleLogin = () => {
        if (email.includes('@')) {
            login(email, password, null);
        } else {
            login(null, password, email);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.innerContainer}>
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <Text style={styles.logoEmoji}>🍔</Text>
                    </View>
                    <Text style={styles.title}>Welcome back</Text>
                    <Text style={styles.subtitle}>Enter your details to continue</Text>
                </View>

                {error && (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}

                <View style={styles.form}>
                    <Text style={styles.label}>Email or Phone</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. name@email.com"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="default"
                        placeholderTextColor={COLORS.textMuted}
                    />

                    <Text style={styles.label}>Password</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        placeholderTextColor={COLORS.textMuted}
                    />

                    <TouchableOpacity
                        style={styles.forgotPassword}
                        onPress={() => { }}
                    >
                        <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, isLoading && styles.buttonDisabled]}
                        onPress={handleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color={COLORS.white} />
                        ) : (
                            <Text style={styles.buttonText}>Log In</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.dividerContainer}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>OR</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    <TouchableOpacity
                        style={[styles.googleButton, isLoading && styles.buttonDisabled]}
                        onPress={() => loginWithGoogle('buyer')}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color={COLORS.secondary} />
                        ) : (
                            <Text style={styles.googleButtonText}>Continue with Google</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>New to Bolt Market? </Text>
                    <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                        <Text style={styles.linkText}>Create an account</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    innerContainer: {
        flex: 1,
        padding: SPACING.lg,
        justifyContent: 'center',
    },
    header: {
        marginBottom: SPACING.xl,
    },
    logoContainer: {
        width: 60,
        height: 60,
        backgroundColor: COLORS.primary,
        borderRadius: RADIUS.lg,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.md,
        ...SHADOWS.light,
    },
    logoEmoji: {
        fontSize: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.secondary,
        marginBottom: SPACING.xs,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textMuted,
    },
    errorContainer: {
        backgroundColor: '#FFE5E5',
        padding: SPACING.md,
        borderRadius: RADIUS.md,
        marginBottom: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.error,
    },
    errorText: {
        color: COLORS.error,
        textAlign: 'center',
        fontWeight: '500',
    },
    form: {
        width: '100%',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.secondary,
        marginBottom: SPACING.sm,
    },
    input: {
        backgroundColor: COLORS.background,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: SPACING.md,
        borderRadius: RADIUS.md,
        marginBottom: SPACING.lg,
        fontSize: 16,
        color: COLORS.secondary,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: SPACING.xl,
    },
    forgotPasswordText: {
        color: COLORS.primary,
        fontWeight: '600',
    },
    button: {
        backgroundColor: COLORS.primary,
        padding: SPACING.md,
        borderRadius: RADIUS.round,
        alignItems: 'center',
        ...SHADOWS.medium,
    },
    buttonDisabled: {
        backgroundColor: COLORS.textMuted,
    },
    buttonText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: SPACING.xxl,
    },
    footerText: {
        color: COLORS.textMuted,
        fontSize: 15,
    },
    linkText: {
        color: COLORS.primary,
        fontSize: 15,
        fontWeight: '700',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: SPACING.xl,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: COLORS.border,
    },
    dividerText: {
        marginHorizontal: SPACING.md,
        color: COLORS.textMuted,
        fontWeight: '600',
    },
    googleButton: {
        backgroundColor: COLORS.white,
        padding: SPACING.md,
        borderRadius: RADIUS.round,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.light,
    },
    googleButtonText: {
        color: COLORS.secondary,
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default LoginScreen;
