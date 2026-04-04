import React, { useEffect, useState } from 'react';
import {
    StyleSheet, Text, View, FlatList, TouchableOpacity,
    Image, ActivityIndicator, SafeAreaView, Platform,
    StatusBar
} from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useAuth as useClerkAuth } from '@clerk/clerk-expo';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

const PRIMARY_COLOR = '#6C47FF';
const PRIMARY_LIGHT = '#F5F3FF';
const BG_COLOR = '#F8FAFC';

interface Event {
    id: number;
    title: string;
    location_text: string;
    date: string;
    price_per_person: number | null;
    communities: { name: string };
    image_placeholder: string;
}

const MOCK_EVENTS: Event[] = [
    {
        id: 1,
        title: "Noida Startup Founders Meetup",
        location_text: "Sector 132, Noida",
        date: "2026-03-20T18:00:00",
        price_per_person: null,
        communities: { name: "Noida Startup Circle" },
        image_placeholder: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=800&auto=format&fit=crop"
    },
    {
        id: 2,
        title: "Weekend Photography Walk",
        location_text: "Botanical Garden",
        date: "2026-03-22T06:30:00",
        price_per_person: 500,
        communities: { name: "Noida Photographers" },
        image_placeholder: "https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?q=80&w=800&auto=format&fit=crop"
    }
];

export default function DiscoveryFeed() {
    const { logout } = useAuth();
    const { getToken } = useClerkAuth();
    const navigation = useNavigation<any>();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const apiBase = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';
            const token = await getToken({ template: 'supabase' }).catch(() => null)
                ?? await getToken().catch(() => null);
            const res = await fetch(`${apiBase}/api/mobile/events`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const json = await res.json();
            if (json.success && json.data?.length > 0) {
                const mapped = json.data.map((e: any, i: number) => ({
                    ...e,
                    image_placeholder: MOCK_EVENTS[i % 2].image_placeholder
                }));
                setEvents(mapped);
            } else {
                setEvents(MOCK_EVENTS);
            }
        } catch (e) {
            console.log('Failed to fetch from localhost, using mock data.');
            setEvents(MOCK_EVENTS);
        } finally {
            setLoading(false);
        }
    };

    const handlePressEvent = async (item: Event) => {
        if (Platform.OS !== 'web') {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        navigation.navigate('EventDetail', { event: item });
    };

    const handleProfilePress = async () => {
        if (Platform.OS !== 'web') {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        logout();
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <BlurView intensity={80} tint="light" style={styles.header}>
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.headerTitle}>Kyoty</Text>
                        <Text style={styles.headerSubtitle}>Discover events near you</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.profileBtn}
                        onPress={handleProfilePress}
                    >
                        <Ionicons name="log-out-outline" size={24} color="#6B7280" />
                    </TouchableOpacity>
                </View>
            </BlurView>

            {/* Discovery Feed */}
            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={PRIMARY_COLOR} />
                    <Text style={styles.loadingText}>Finding events...</Text>
                </View>
            ) : (
                <FlatList
                    data={events}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={() => handlePressEvent(item)}
                            style={styles.card}
                        >
                            <Image source={{ uri: item.image_placeholder }} style={styles.cardImage} />

                            {/* Date badge on image */}
                            <View style={styles.dateBadge}>
                                <Text style={styles.dateBadgeMonth}>
                                    {new Date(item.date).toLocaleDateString(undefined, { month: 'short' }).toUpperCase()}
                                </Text>
                                <Text style={styles.dateBadgeDay}>
                                    {new Date(item.date).getDate()}
                                </Text>
                            </View>

                            {/* Price badge */}
                            <View style={styles.priceBadge}>
                                <Text style={styles.priceText}>
                                    {item.price_per_person ? `₹${item.price_per_person}` : 'Free'}
                                </Text>
                            </View>

                            <View style={styles.cardContent}>
                                {/* Community pill */}
                                <View style={styles.communityPill}>
                                    <View style={styles.communityDot} />
                                    <Text style={styles.communityText}>{item.communities?.name || 'Community'}</Text>
                                </View>

                                <Text style={styles.title} numberOfLines={2}>
                                    {item.title}
                                </Text>

                                <View style={styles.metaRow}>
                                    <Ionicons name="location-outline" size={14} color="#6B7280" />
                                    <Text style={styles.metaText}>{item.location_text}</Text>
                                </View>

                                <View style={styles.metaRow}>
                                    <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                                    <Text style={styles.metaText}>
                                        {new Date(item.date).toLocaleDateString(undefined, {
                                            weekday: 'short',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BG_COLOR,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    loadingText: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    header: {
        position: 'absolute',
        top: 0,
        width: '100%',
        zIndex: 10,
        paddingTop: Platform.OS === 'android' ? 40 : 0,
    },
    headerContent: {
        paddingHorizontal: 20,
        paddingVertical: 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(248,250,252,0.85)',
        paddingTop: 40,
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: '800',
        color: PRIMARY_COLOR,
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 2,
        fontWeight: '500',
    },
    profileBtn: {
        height: 40,
        width: 40,
        borderRadius: 12,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        paddingTop: 120,
        paddingBottom: 40,
        paddingHorizontal: 16,
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 3,
        overflow: 'hidden',
    },
    cardImage: {
        width: '100%',
        height: 180,
    },
    dateBadge: {
        position: 'absolute',
        top: 12,
        left: 12,
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 6,
        alignItems: 'center',
        minWidth: 44,
    },
    dateBadgeMonth: {
        fontSize: 10,
        fontWeight: '700',
        color: PRIMARY_COLOR,
        letterSpacing: 0.5,
    },
    dateBadgeDay: {
        fontSize: 18,
        fontWeight: '800',
        color: '#0F172A',
        lineHeight: 22,
    },
    priceBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    priceText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#0F172A',
    },
    cardContent: {
        padding: 16,
    },
    communityPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: PRIMARY_LIGHT,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 5,
        alignSelf: 'flex-start',
        marginBottom: 10,
        gap: 6,
    },
    communityDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: PRIMARY_COLOR,
    },
    communityText: {
        fontSize: 12,
        fontWeight: '600',
        color: PRIMARY_COLOR,
    },
    title: {
        fontSize: 17,
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: 10,
        lineHeight: 22,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    metaText: {
        fontSize: 13,
        color: '#6B7280',
        fontWeight: '500',
    },
});
