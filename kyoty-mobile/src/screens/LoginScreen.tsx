import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    ActivityIndicator, KeyboardAvoidingView, Platform, Alert, ScrollView
} from 'react-native';
import { useSignIn, useSignUp } from '@clerk/clerk-expo';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

const PRIMARY_COLOR = '#6C47FF';
const PRIMARY_LIGHT = '#F5F3FF';
const BG_COLOR = '#F8FAFC';

export default function LoginScreen() {
    const { signIn, setActive: setSignInActive, isLoaded: signInLoaded } = useSignIn();
    const { signUp, setActive: setSignUpActive, isLoaded: signUpLoaded } = useSignUp();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        if (!signInLoaded || !signIn) return;
        try {
            const result = await signIn.create({ identifier: email, password });
            if (result.status === 'complete' && result.createdSessionId) {
                await setSignInActive({ session: result.createdSessionId });
            } else {
                Alert.alert('Login Failed', 'Could not complete sign-in. Please try again.');
            }
        } catch (err: any) {
            const msg = err?.errors?.[0]?.longMessage ?? err?.message ?? 'Login failed';
            Alert.alert('Login Failed', msg);
        }
    };

    const handleRegister = async () => {
        if (!signUpLoaded || !signUp) return;
        try {
            const [firstName, ...rest] = name.trim().split(' ');
            const lastName = rest.join(' ') || undefined;

            const result = await signUp.create({
                emailAddress: email,
                password,
                firstName,
                lastName,
            });

            if (result.status === 'complete' && result.createdSessionId) {
                await setSignUpActive({ session: result.createdSessionId });
            } else if (result.status === 'missing_requirements') {
                Alert.alert('Check your email', 'We sent a verification link. Please verify and try signing in.');
            } else {
                Alert.alert('Registration', 'Account created. Please sign in.');
            }
        } catch (err: any) {
            const msg = err?.errors?.[0]?.longMessage ?? err?.message ?? 'Registration failed';
            Alert.alert('Registration Failed', msg);
        }
    };

    const handleSubmit = async () => {
        if (!email || !password || (!isLogin && !name)) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (Platform.OS !== 'web') {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }

        setLoading(true);
        try {
            if (isLogin) {
                await handleLogin();
            } else {
                await handleRegister();
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Logo */}
                <View style={styles.logoContainer}>
                    <View style={styles.logoBox}>
                        <Text style={styles.logoText}>K</Text>
                    </View>
                    <Text style={styles.logoTitle}>Kyoty</Text>
                    <Text style={styles.logoSubtitle}>Communities & Events</Text>
                </View>

                {/* Card */}
                <BlurView intensity={90} tint="light" style={styles.card}>
                    <Text style={styles.title}>
                        {isLogin ? 'Welcome back' : 'Create account'}
                    </Text>
                    <Text style={styles.subtitle}>
                        {isLogin
                            ? 'Sign in to discover events near you.'
                            : 'Join Kyoty to explore communities.'}
                    </Text>

                    {!isLogin && (
                        <View style={styles.inputContainer}>
                            <Ionicons name="person-outline" size={18} color="#94A3B8" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Full name"
                                placeholderTextColor="#94A3B8"
                                value={name}
                                onChangeText={setName}
                                autoCapitalize="words"
                            />
                        </View>
                    )}

                    <View style={styles.inputContainer}>
                        <Ionicons name="mail-outline" size={18} color="#94A3B8" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Email address"
                            placeholderTextColor="#94A3B8"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Ionicons name="lock-closed-outline" size={18} color="#94A3B8" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder={isLogin ? 'Password' : 'Password (min. 8 chars)'}
                            placeholderTextColor="#94A3B8"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity
                            onPress={() => setShowPassword(!showPassword)}
                            style={styles.eyeBtn}
                        >
                            <Ionicons
                                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                size={18}
                                color="#94A3B8"
                            />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleSubmit}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.buttonText}>
                                {isLogin ? 'Sign in' : 'Create account'}
                            </Text>
                        )}
                    </TouchableOpacity>

                    {/* Divider */}
                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>or</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    {/* Toggle */}
                    <TouchableOpacity
                        style={styles.switchButton}
                        onPress={() => {
                            setIsLogin(!isLogin);
                            if (Platform.OS !== 'web') {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            }
                        }}
                    >
                        <Text style={styles.switchText}>
                            {isLogin ? "Don't have an account? " : 'Already have an account? '}
                            <Text style={styles.switchTextBold}>
                                {isLogin ? 'Sign up' : 'Sign in'}
                            </Text>
                        </Text>
                    </TouchableOpacity>
                </BlurView>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BG_COLOR,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logoBox: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: PRIMARY_COLOR,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: PRIMARY_COLOR,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
    },
    logoText: {
        fontSize: 20,
        fontWeight: '800',
        color: '#FFF',
    },
    logoTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#0F172A',
        marginTop: 12,
    },
    logoSubtitle: {
        fontSize: 13,
        color: '#64748B',
        marginTop: 4,
        fontWeight: '500',
    },
    card: {
        padding: 28,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#0F172A',
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 14,
        color: '#64748B',
        marginBottom: 28,
        lineHeight: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    inputIcon: {
        paddingLeft: 14,
    },
    input: {
        flex: 1,
        padding: 14,
        paddingLeft: 10,
        fontSize: 15,
        color: '#0F172A',
    },
    eyeBtn: {
        paddingRight: 14,
        paddingVertical: 14,
    },
    button: {
        backgroundColor: PRIMARY_COLOR,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 6,
        shadowColor: PRIMARY_COLOR,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 3,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E2E8F0',
    },
    dividerText: {
        marginHorizontal: 12,
        fontSize: 12,
        color: '#94A3B8',
        fontWeight: '500',
    },
    switchButton: {
        alignItems: 'center',
    },
    switchText: {
        color: '#64748B',
        fontSize: 14,
        fontWeight: '500',
    },
    switchTextBold: {
        color: PRIMARY_COLOR,
        fontWeight: '700',
    },
});
