import { Feather } from "@expo/vector-icons";
import { useGetUserListings } from "@workspace/api-client-react";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ListingCard } from "@/components/ListingCard";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const router = useRouter();

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const { data: myListings, isLoading } = useGetUserListings(
    user?.id ?? 0,
    { query: { enabled: !!user } }
  );

  if (!user) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background, paddingTop: topPad }]}>
        <View style={[styles.bigAvatar, { backgroundColor: colors.primary }]}>
          <Feather name="user" size={48} color="#fff" />
        </View>
        <Text style={[styles.guestTitle, { color: colors.foreground }]}>حسابي</Text>
        <Text style={[styles.guestSub, { color: colors.mutedForeground }]}>
          سجّل دخولك للوصول إلى ملفك الشخصي وإعلاناتك
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

  const handleLogout = async () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await logout();
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topPad + 16 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile header */}
      <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>{user.name?.[0] ?? "؟"}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={[styles.name, { color: colors.foreground }]}>{user.name}</Text>
          <Text style={[styles.uni, { color: colors.mutedForeground }]}>{user.university}</Text>
          {user.bio && (
            <Text style={[styles.bio, { color: colors.mutedForeground }]}>{user.bio}</Text>
          )}
        </View>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statNum, { color: colors.primary }]}>{myListings?.length ?? 0}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>إعلاناتي</Text>
        </View>
      </View>

      {/* My listings */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>إعلاناتي</Text>
      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} />
      ) : !myListings?.length ? (
        <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="plus-circle" size={32} color={colors.mutedForeground} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>لا توجد إعلانات بعد</Text>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/sell")}
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={[styles.addBtnText, { color: "#fff" }]}>أضف إعلانك الأول</Text>
          </TouchableOpacity>
        </View>
      ) : (
        myListings.map((item) => <ListingCard key={item.id} listing={item} />)
      )}

      {/* Logout */}
      <TouchableOpacity
        onPress={handleLogout}
        style={[styles.logoutBtn, { borderColor: colors.destructive }]}
      >
        <Feather name="log-out" size={18} color={colors.destructive} />
        <Text style={[styles.logoutText, { color: colors.destructive }]}>تسجيل الخروج</Text>
      </TouchableOpacity>

      <View style={{ height: Platform.OS === "web" ? 100 : 90 + insets.bottom }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 16 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingHorizontal: 32 },
  guestTitle: { fontSize: 22, fontWeight: "700", fontFamily: "Tajawal_700Bold", textAlign: "center" },
  guestSub: { fontSize: 14, fontFamily: "Tajawal_400Regular", textAlign: "center" },
  bigAvatar: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center" },
  loginBtn: { paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12, marginTop: 8 },
  loginBtnText: { fontSize: 16, fontWeight: "700", fontFamily: "Tajawal_700Bold" },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 16,
  },
  avatar: { width: 60, height: 60, borderRadius: 30, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 26, color: "#fff", fontWeight: "700", fontFamily: "Tajawal_700Bold" },
  profileInfo: { flex: 1, gap: 2 },
  name: { fontSize: 18, fontWeight: "700", fontFamily: "Tajawal_700Bold" },
  uni: { fontSize: 13, fontFamily: "Tajawal_400Regular" },
  bio: { fontSize: 13, fontFamily: "Tajawal_400Regular", marginTop: 4 },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
  statCard: { flex: 1, borderRadius: 12, borderWidth: 1.5, padding: 16, alignItems: "center" },
  statNum: { fontSize: 28, fontWeight: "900", fontFamily: "Tajawal_900Black" },
  statLabel: { fontSize: 12, fontFamily: "Tajawal_400Regular" },
  sectionTitle: { fontSize: 18, fontWeight: "800", fontFamily: "Tajawal_700Bold", marginBottom: 12 },
  emptyCard: {
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 28,
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  emptyText: { fontSize: 15, fontFamily: "Tajawal_400Regular", textAlign: "center" },
  addBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, marginTop: 4 },
  addBtnText: { fontSize: 14, fontWeight: "700", fontFamily: "Tajawal_700Bold" },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 16,
  },
  logoutText: { fontSize: 16, fontWeight: "700", fontFamily: "Tajawal_700Bold" },
});
