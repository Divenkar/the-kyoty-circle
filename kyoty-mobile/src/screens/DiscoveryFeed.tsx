import React, { useEffect, useState } from 'react';
import {
    StyleSheet, Text, View, FlatList, TouchableOpacity,
    Image, ActivityIndicator, SafeAreaView, Platform,
    StatusBar
} from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

const PRIMARY_COLOR = '#FF5A5F';
const BG_COLOR = '#FAFAFA';

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
    const navigation = useNavigation<any>();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const apiBase = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';
            const res = await fetch(`${apiBase}/api/mobile/events`);
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
        logout(); // Let users log out for now
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header with Glassmorphism */}
            <BlurView intensity={80} tint="light" style={styles.header}>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Kyoty</Text>
                    <TouchableOpacity
                        style={styles.profileBtn}
                        onPress={handleProfilePress}
                    >
                        <Ionicons name="log-out-outline" size={32} color="#333" />
                    </TouchableOpacity>
                </View>
            </BlurView>

            {/* Discovery Feed */}
            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={PRIMARY_COLOR} />
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

                            <View style={styles.cardContent}>
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>{item.communities?.name || 'Community'}</Text>
                                </View>

                                <Text style={styles.title} numberOfLines={2}>
                                    {item.title}
                                </Text>

                                <View style={styles.row}>
                                    <Ionicons name="location-outline" size={16} color="#666" />
                                    <Text style={styles.subtitle}>{item.location_text}</Text>
                                </View>

                                <View style={[styles.row, { marginTop: 12, justifyContent: 'space-between' }]}>
                                    <Text style={styles.date}>
                                        {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </Text>
                                    <Text style={styles.price}>
                                        {item.price_per_person ? `₹${item.price_per_person}` : 'Free'}
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
        alignItems: 'center'
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
        paddingVertical: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.4)',
        paddingTop: 40 // Make sure safe area header is big enough for iOS
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: PRIMARY_COLOR,
        letterSpacing: -0.5,
    },
    profileBtn: {
        padding: 4,
    },
    listContainer: {
        paddingTop: 120, // accommodate fixed header
        paddingBottom: 40,
        paddingHorizontal: 20,
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 4,
    },
    cardImage: {
        width: '100%',
        height: 200,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    cardContent: {
        padding: 20,
    },
    badge: {
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
        marginBottom: 12,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#4B5563',
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 8,
        lineHeight: 26,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginLeft: 6,
        fontWeight: '500',
    },
    date: {
        fontSize: 15,
        fontWeight: '600',
        color: PRIMARY_COLOR,
    },
    price: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    }
});
