import { Feather } from "@expo/vector-icons";
import { useGetListing } from "@workspace/api-client-react";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

const BASE = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

function resolveImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${BASE}${url}`;
}

export default function ListingDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user, token } = useAuth();
  const [showContact, setShowContact] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const { data: listing, isLoading } = useGetListing(Number(id));

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const imageUri = resolveImageUrl(listing?.imageUrl);

  const handleContact = async () => {
    if (!user || !token) { router.push("/auth"); return; }
    if (!message.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`${BASE}/api/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ receiverId: listing?.sellerId, listingId: Number(id), content: message.trim() }),
      });
      if (!res.ok) throw new Error("فشل الإرسال");
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setMessage("");
      setShowContact(false);
      Alert.alert("تم!", "أُرسلت رسالتك إلى البائع");
    } catch (e: any) {
      Alert.alert("خطأ", e.message);
    } finally {
      setSending(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  if (!listing) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Feather name="alert-circle" size={40} color={colors.destructive} />
        <Text style={[styles.errorText, { color: colors.foreground }]}>الإعلان غير موجود</Text>
      </View>
    );
  }

  const tags = listing.tags ? listing.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        {/* Back button */}
        <View style={[styles.backRow, { paddingTop: topPad + 8 }]}>
          <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="arrow-right" size={20} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        {/* Image */}
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: colors.muted }]}>
            <Feather name="image" size={48} color={colors.mutedForeground} />
          </View>
        )}

        <View style={styles.body}>
          {/* Category badge */}
          <View style={[styles.badge, { backgroundColor: colors.primary + "22" }]}>
            <Text style={[styles.badgeText, { color: colors.primary }]}>{listing.category}</Text>
          </View>

          {/* Title + Price */}
          <Text style={[styles.title, { color: colors.foreground }]}>{listing.title}</Text>
          <Text style={[styles.price, { color: colors.primary }]}>
            {listing.price === 0 ? "مجاني" : `${listing.price} دينار أردني`}
          </Text>

          {/* Seller info */}
          <View style={[styles.sellerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.sellerAvatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.sellerAvatarText}>{listing.sellerName?.[0] ?? "؟"}</Text>
            </View>
            <View style={styles.sellerInfo}>
              <Text style={[styles.sellerName, { color: colors.foreground }]}>{listing.sellerName}</Text>
              <Text style={[styles.sellerUni, { color: colors.mutedForeground }]}>{listing.sellerUniversity}</Text>
            </View>
          </View>

          {/* Description */}
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>الوصف</Text>
          <Text style={[styles.description, { color: colors.foreground }]}>{listing.description}</Text>

          {/* Tags */}
          {tags.length > 0 && (
            <View style={styles.tagsRow}>
              {tags.map((tag) => (
                <View key={tag} style={[styles.tag, { backgroundColor: colors.muted }]}>
                  <Text style={[styles.tagText, { color: colors.mutedForeground }]}>{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Status */}
          {listing.status !== "available" && (
            <View style={[styles.statusBanner, { backgroundColor: listing.status === "sold" ? colors.destructive + "22" : colors.accent + "44" }]}>
              <Text style={[styles.statusText, { color: listing.status === "sold" ? colors.destructive : colors.accentForeground }]}>
                {listing.status === "sold" ? "تم البيع" : "محجوز"}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Contact panel */}
      <View style={[styles.bottomBar, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: insets.bottom + 8 }]}>
        {showContact ? (
          <View style={styles.contactRow}>
            <TextInput
              style={[styles.msgInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]}
              placeholder="اكتب رسالتك للبائع..."
              placeholderTextColor={colors.mutedForeground}
              value={message}
              onChangeText={setMessage}
              textAlign="right"
              autoFocus
            />
            <TouchableOpacity
              onPress={handleContact}
              disabled={sending || !message.trim()}
              style={[styles.sendBtn, { backgroundColor: sending ? colors.muted : colors.primary }]}
            >
              {sending ? <ActivityIndicator color="#fff" size="small" /> : <Feather name="send" size={18} color="#fff" />}
            </TouchableOpacity>
          </View>
        ) : (
          listing.status === "available" && (user?.id !== listing.sellerId) ? (
            <TouchableOpacity
              onPress={() => { if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setShowContact(true); }}
              style={[styles.contactBtn, { backgroundColor: colors.primary }]}
            >
              <Feather name="message-circle" size={20} color="#fff" />
              <Text style={[styles.contactBtnText, { color: "#fff" }]}>تواصل مع البائع</Text>
            </TouchableOpacity>
          ) : null
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  errorText: { fontSize: 16, fontFamily: "Tajawal_400Regular" },
  backRow: { paddingHorizontal: 16, paddingBottom: 8 },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", borderWidth: 1.5 },
  image: { width: "100%", height: 260 },
  imagePlaceholder: { width: "100%", height: 260, alignItems: "center", justifyContent: "center" },
  body: { padding: 16, gap: 10 },
  badge: { alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: "700", fontFamily: "Tajawal_700Bold" },
  title: { fontSize: 22, fontWeight: "800", fontFamily: "Tajawal_900Black" },
  price: { fontSize: 24, fontWeight: "900", fontFamily: "Tajawal_900Black" },
  sellerCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  sellerAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  sellerAvatarText: { color: "#fff", fontSize: 18, fontWeight: "700", fontFamily: "Tajawal_700Bold" },
  sellerInfo: { flex: 1 },
  sellerName: { fontSize: 15, fontWeight: "700", fontFamily: "Tajawal_700Bold" },
  sellerUni: { fontSize: 12, fontFamily: "Tajawal_400Regular" },
  sectionTitle: { fontSize: 16, fontWeight: "700", fontFamily: "Tajawal_700Bold" },
  description: { fontSize: 15, lineHeight: 24, fontFamily: "Tajawal_400Regular" },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  tagText: { fontSize: 12, fontFamily: "Tajawal_400Regular" },
  statusBanner: { borderRadius: 10, padding: 12, alignItems: "center" },
  statusText: { fontSize: 15, fontWeight: "700", fontFamily: "Tajawal_700Bold" },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  contactBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  contactBtnText: { fontSize: 16, fontWeight: "700", fontFamily: "Tajawal_700Bold" },
  contactRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  msgInput: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: "Tajawal_400Regular",
  },
  sendBtn: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
});
