import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Platform, StatusBar, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth as useClerkAuth } from '@clerk/clerk-expo';
import { useAuth } from '../context/AuthContext';
import { createSupabaseClient } from '../lib/supabase';

const PRIMARY_COLOR = '#6C47FF';
const PRIMARY_LIGHT = '#F5F3FF';

export default function EventDetailScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { event } = route.params;
    const { user } = useAuth();
    const { getToken } = useClerkAuth();
    const [rsvpLoading, setRsvpLoading] = useState(false);
    const [rsvpDone, setRsvpDone] = useState(false);

    const handleBack = () => {
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        navigation.goBack();
    };

    const handleRSVP = async () => {
        if (Platform.OS !== 'web') {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        }

        if (!user || user.id === 0) {
            Alert.alert('Error', 'Please sign in to RSVP for events.');
            return;
        }

        setRsvpLoading(true);
        try {
            // Use the Clerk session token (not Supabase template) for API auth
            const token = await getToken().catch(() => null);

            const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? 'https://kyoty.in';

            const res = await fetch(`${apiUrl}/api/mobile/events/join`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ eventId: event.id }),
            });

            const body = await res.json();

            if (body.success) {
                setRsvpDone(true);
                const msg = body.data?.status === 'waitlisted'
                    ? `You're on the waitlist (#${body.data.position || ''}). We'll notify you when a spot opens up!`
                    : 'You have been registered for this event!';
                Alert.alert('Success', msg);
            } else {
                const errorMsg = body.error || 'Failed to register for event.';
                if (errorMsg.includes('already registered')) {
                    Alert.alert('Already Registered', 'You have already RSVP\'d for this event.');
                    setRsvpDone(true);
                } else {
                    Alert.alert('Error', errorMsg);
                }
            }
        } catch (e: any) {
            Alert.alert('Error', e?.message || 'Something went wrong.');
        } finally {
            setRsvpLoading(false);
        }
    };

    const formattedDate = new Date(event.date).toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const formattedTime = new Date(event.date).toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            <ScrollView bounces={false} style={styles.scrollView} contentContainerStyle={{ paddingBottom: 100 }}>
                <View style={styles.imageContainer}>
                    <Image source={{ uri: event.image_placeholder }} style={styles.image} />

                    <SafeAreaView style={styles.navHeader}>
                        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                            <BlurView intensity={80} tint="dark" style={styles.backButtonBlur}>
                                <Ionicons name="chevron-back" size={24} color="#FFF" />
                            </BlurView>
                        </TouchableOpacity>
                    </SafeAreaView>
                </View>

                <View style={styles.content}>
                    <View style={styles.communityBadge}>
                        <Text style={styles.communityText}>{event.communities?.name}</Text>
                    </View>

                    <Text style={styles.title}>{event.title}</Text>

                    <View style={styles.cardInfo}>
                        <View style={styles.infoRow}>
                            <View style={styles.iconBox}>
                                <Ionicons name="calendar-outline" size={24} color={PRIMARY_COLOR} />
                            </View>
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.infoTitle}>{formattedDate}</Text>
                                <Text style={styles.infoSubtitle}>{formattedTime}</Text>
                            </View>
                        </View>

                        <View style={styles.infoRow}>
                            <View style={styles.iconBox}>
                                <Ionicons name="location-outline" size={24} color={PRIMARY_COLOR} />
                            </View>
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.infoTitle}>Location</Text>
                                <Text style={styles.infoSubtitle}>{event.location_text}</Text>
                            </View>
                        </View>

                        <View style={styles.infoRow}>
                            <View style={styles.iconBox}>
                                <Ionicons name="ticket-outline" size={24} color={PRIMARY_COLOR} />
                            </View>
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.infoTitle}>Tickets</Text>
                                <Text style={styles.infoSubtitle}>
                                    {event.price_per_person ? `₹${event.price_per_person}` : 'Free Entry'}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>About</Text>
                        <Text style={styles.description}>
                            Join us for an amazing gathering at {event.location_text}. This event is hosted by {event.communities?.name}.
                            Expect great networking, insightful conversations, and a vibrant community atmosphere.
                            Make sure to RSVP early as spots are limited!
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Action Bar */}
            <View style={styles.bottomBar}>
                <BlurView intensity={100} tint="light" style={styles.bottomBarBlur}>
                    <SafeAreaView edges={['bottom']}>
                        <View style={styles.bottomBarContent}>
                            <View>
                                <Text style={styles.priceLabel}>Total Price</Text>
                                <Text style={styles.priceValue}>
                                    {event.price_per_person ? `₹${event.price_per_person}` : 'Free'}
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={[styles.rsvpButton, rsvpDone && styles.rsvpButtonDone]}
                                onPress={handleRSVP}
                                disabled={rsvpLoading || rsvpDone}
                            >
                                {rsvpLoading ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <Text style={styles.rsvpButtonText}>
                                        {rsvpDone ? 'Registered' : 'Get Tickets'}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                </BlurView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    scrollView: {
        flex: 1,
    },
    imageContainer: {
        height: 350,
        width: '100%',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    navHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 40 : 0,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        overflow: 'hidden',
        marginTop: 10,
    },
    backButtonBlur: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    content: {
        padding: 24,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        backgroundColor: '#FFF',
        marginTop: -32,
    },
    communityBadge: {
        backgroundColor: PRIMARY_LIGHT,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginBottom: 16,
    },
    communityText: {
        color: PRIMARY_COLOR,
        fontWeight: '700',
        fontSize: 14,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#111827',
        lineHeight: 34,
        marginBottom: 24,
    },
    cardInfo: {
        backgroundColor: '#F9FAFB',
        padding: 20,
        borderRadius: 20,
        marginBottom: 32,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: PRIMARY_LIGHT,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    infoTextContainer: {
        flex: 1,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    infoSubtitle: {
        fontSize: 14,
        color: '#6B7280',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 12,
    },
    description: {
        fontSize: 16,
        lineHeight: 26,
        color: '#4B5563',
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    bottomBarBlur: {
        paddingTop: 16,
        paddingHorizontal: 24,
        backgroundColor: 'rgba(255,255,255,0.85)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    bottomBarContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: Platform.OS === 'android' ? 16 : 0,
    },
    priceLabel: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
        marginBottom: 4,
    },
    priceValue: {
        fontSize: 22,
        fontWeight: '800',
        color: '#111827',
    },
    rsvpButton: {
        backgroundColor: PRIMARY_COLOR,
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 16,
        shadowColor: PRIMARY_COLOR,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    rsvpButtonDone: {
        backgroundColor: '#10B981',
        shadowColor: '#10B981',
    },
    rsvpButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '700',
    }
});
