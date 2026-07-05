import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { SECTIONS } from "@/constants/sections";

const BASE = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

const CATEGORIES = ["إلكترونيات", "ملابس", "كتب", "أثاث", "رياضة", "طعام", "أخرى"];

export default function SellScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, token } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDesc] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [section, setSection] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  if (!user) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background, paddingTop: topPad }]}>
        <Feather name="shopping-bag" size={56} color={colors.primary} />
        <Text style={[styles.guestTitle, { color: colors.foreground }]}>أضف إعلانك</Text>
        <Text style={[styles.guestSub, { color: colors.mutedForeground }]}>
          سجّل دخولك لنشر إعلان في سوق الطلاب
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

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !category) {
      Alert.alert("خطأ", "يرجى ملء الحقول المطلوبة");
      return;
    }
    setSubmitting(true);
    try {
      const body: any = {
        title: title.trim(),
        description: description.trim(),
        price: parseFloat(price) || 0,
        category: section || category,
        sellerId: user.id,
        imageUrl: imageUrl.trim() || undefined,
      };
      const res = await fetch(`${BASE}/api/listings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("فشل نشر الإعلان");
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("تم!", "نشر إعلانك بنجاح", [
        { text: "حسناً", onPress: () => { setTitle(""); setDesc(""); setPrice(""); setCategory(""); setSection(""); setImageUrl(""); router.push("/(tabs)/browse"); } },
      ]);
    } catch (e: any) {
      Alert.alert("خطأ", e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topPad + 16 }]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.pageTitle, { color: colors.foreground }]}>نشر إعلان جديد</Text>

      {/* Section picker */}
      <Text style={[styles.label, { color: colors.foreground }]}>القسم *</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
        {SECTIONS.map((s) => {
          const active = section === s.key;
          return (
            <TouchableOpacity
              key={s.key}
              onPress={() => setSection(active ? "" : s.key)}
              style={[styles.chip, { backgroundColor: active ? colors.primary : colors.card, borderColor: active ? colors.primary : colors.border }]}
            >
              <Text style={[styles.chipText, { color: active ? "#fff" : colors.foreground }]}>{s.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Title */}
      <Text style={[styles.label, { color: colors.foreground }]}>العنوان *</Text>
      <TextInput
        style={[styles.input, { color: colors.foreground, backgroundColor: colors.card, borderColor: colors.border }]}
        value={title}
        onChangeText={setTitle}
        placeholder="عنوان الإعلان"
        placeholderTextColor={colors.mutedForeground}
        textAlign="right"
        maxLength={100}
      />

      {/* Description */}
      <Text style={[styles.label, { color: colors.foreground }]}>الوصف *</Text>
      <TextInput
        style={[styles.input, styles.multiline, { color: colors.foreground, backgroundColor: colors.card, borderColor: colors.border }]}
        value={description}
        onChangeText={setDesc}
        placeholder="وصف تفصيلي للإعلان"
        placeholderTextColor={colors.mutedForeground}
        multiline
        textAlignVertical="top"
        textAlign="right"
        numberOfLines={4}
        maxLength={500}
      />

      {/* Price */}
      <Text style={[styles.label, { color: colors.foreground }]}>السعر (د.أ)</Text>
      <TextInput
        style={[styles.input, { color: colors.foreground, backgroundColor: colors.card, borderColor: colors.border }]}
        value={price}
        onChangeText={setPrice}
        placeholder="0 = مجاني"
        placeholderTextColor={colors.mutedForeground}
        keyboardType="numeric"
        textAlign="right"
      />

      {/* Category */}
      <Text style={[styles.label, { color: colors.foreground }]}>الفئة</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
        {CATEGORIES.map((c) => {
          const active = category === c;
          return (
            <TouchableOpacity
              key={c}
              onPress={() => setCategory(active ? "" : c)}
              style={[styles.chip, { backgroundColor: active ? colors.secondary : colors.card, borderColor: active ? colors.secondary : colors.border }]}
            >
              <Text style={[styles.chipText, { color: active ? "#fff" : colors.foreground }]}>{c}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Image URL */}
      <Text style={[styles.label, { color: colors.foreground }]}>رابط الصورة (اختياري)</Text>
      <TextInput
        style={[styles.input, { color: colors.foreground, backgroundColor: colors.card, borderColor: colors.border }]}
        value={imageUrl}
        onChangeText={setImageUrl}
        placeholder="https://..."
        placeholderTextColor={colors.mutedForeground}
        keyboardType="url"
        textAlign="left"
        autoCapitalize="none"
      />

      {/* Submit */}
      <TouchableOpacity
        onPress={handleSubmit}
        disabled={submitting}
        style={[styles.submitBtn, { backgroundColor: submitting ? colors.muted : colors.primary }]}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={[styles.submitText, { color: colors.primaryForeground }]}>نشر الإعلان</Text>
        )}
      </TouchableOpacity>

      <View style={{ height: Platform.OS === "web" ? 100 : 90 + insets.bottom }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 16 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingHorizontal: 32 },
  pageTitle: { fontSize: 22, fontWeight: "900", fontFamily: "Tajawal_900Black", marginBottom: 20 },
  guestTitle: { fontSize: 22, fontWeight: "700", fontFamily: "Tajawal_700Bold", textAlign: "center" },
  guestSub: { fontSize: 14, fontFamily: "Tajawal_400Regular", textAlign: "center" },
  loginBtn: { paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12, marginTop: 8 },
  loginBtnText: { fontSize: 16, fontWeight: "700", fontFamily: "Tajawal_700Bold" },
  label: { fontSize: 14, fontWeight: "700", fontFamily: "Tajawal_700Bold", marginBottom: 6, marginTop: 16 },
  input: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: "Tajawal_400Regular",
  },
  multiline: { height: 100, paddingTop: 12 },
  chipScroll: { marginBottom: 4 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    marginRight: 8,
  },
  chipText: { fontSize: 13, fontWeight: "600", fontFamily: "Tajawal_700Bold" },
  submitBtn: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 28,
  },
  submitText: { fontSize: 16, fontWeight: "800", fontFamily: "Tajawal_700Bold" },
});
