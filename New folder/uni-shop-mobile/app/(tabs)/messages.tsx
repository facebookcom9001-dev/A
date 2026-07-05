import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

const BASE = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

interface Conversation {
  otherUserId: number;
  otherUserName: string;
  listingId: number;
  listingTitle: string;
  lastMessage: string;
  updatedAt: string;
}

export default function MessagesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, token } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const loadConversations = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/messages/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setConversations(Array.isArray(data) ? data : []);
      }
    } catch {
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (user) loadConversations();
  }, [user, loadConversations]);

  if (!user) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background, paddingTop: topPad }]}>
        <Feather name="message-circle" size={56} color={colors.primary} />
        <Text style={[styles.guestTitle, { color: colors.foreground }]}>الرسائل</Text>
        <Text style={[styles.guestSub, { color: colors.mutedForeground }]}>
          سجّل دخولك لعرض محادثاتك
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/auth")}
          style={[styles.loginBtn, { backgroundColor: colors.primary }]}
        >
          <Text style={[styles.loginBtnText, { color: colors.primaryForeground }]}>تسجيل الدخول</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <Text style={[styles.pageTitle, { color: colors.foreground }]}>الرسائل</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => `${item.otherUserId}-${item.listingId}`}
          onRefresh={loadConversations}
          refreshing={loading}
          scrollEnabled={!!conversations.length}
          ListEmptyComponent={
            <View style={styles.emptyCenter}>
              <Feather name="message-circle" size={40} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                لا توجد محادثات بعد
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              style={[styles.convRow, { borderBottomColor: colors.border, backgroundColor: colors.card }]}
            >
              <View style={[styles.avatar, { backgroundColor: colors.primary + "22" }]}>
                <Text style={[styles.avatarText, { color: colors.primary }]}>
                  {item.otherUserName?.[0] ?? "؟"}
                </Text>
              </View>
              <View style={styles.convInfo}>
                <Text style={[styles.convName, { color: colors.foreground }]}>{item.otherUserName}</Text>
                <Text style={[styles.convListing, { color: colors.mutedForeground }]} numberOfLines={1}>
                  {item.listingTitle}
                </Text>
                <Text style={[styles.convMsg, { color: colors.mutedForeground }]} numberOfLines={1}>
                  {item.lastMessage}
                </Text>
              </View>
              <Feather name="chevron-left" size={18} color={colors.mutedForeground} />
            </Pressable>
          )}
          contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 100 : 90 + insets.bottom }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingHorizontal: 32 },
  header: { paddingHorizontal: 16, paddingBottom: 8 },
  pageTitle: { fontSize: 22, fontWeight: "900", fontFamily: "Tajawal_900Black" },
  guestTitle: { fontSize: 22, fontWeight: "700", fontFamily: "Tajawal_700Bold", textAlign: "center" },
  guestSub: { fontSize: 14, fontFamily: "Tajawal_400Regular", textAlign: "center" },
  loginBtn: { paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12, marginTop: 8 },
  loginBtnText: { fontSize: 16, fontWeight: "700", fontFamily: "Tajawal_700Bold" },
  emptyCenter: { alignItems: "center", gap: 12, marginTop: 60 },
  emptyText: { fontSize: 16, fontFamily: "Tajawal_400Regular" },
  convRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 20, fontWeight: "700", fontFamily: "Tajawal_700Bold" },
  convInfo: { flex: 1, gap: 2 },
  convName: { fontSize: 15, fontWeight: "700", fontFamily: "Tajawal_700Bold" },
  convListing: { fontSize: 12, fontFamily: "Tajawal_400Regular" },
  convMsg: { fontSize: 13, fontFamily: "Tajawal_400Regular" },
});
