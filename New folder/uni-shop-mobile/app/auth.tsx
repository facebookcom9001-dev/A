import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function AuthScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { sendOtp, verifyOtp } = useAuth();

  const [step, setStep] = useState<"email" | "otp" | "profile">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [university, setUniversity] = useState("");
  const [loading, setLoading] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);

  const UNIVERSITIES = [
    "الجامعة الأردنية",
    "جامعة العلوم والتكنولوجيا",
    "جامعة اليرموك",
    "جامعة مؤتة",
    "الجامعة الهاشمية",
    "جامعة البترا",
    "أخرى",
  ];

  const handleSendOtp = async () => {
    if (!email.trim().endsWith(".edu.jo")) {
      Alert.alert("خطأ", "يرجى استخدام بريدك الجامعي (.edu.jo)");
      return;
    }
    setLoading(true);
    try {
      await sendOtp(email.trim());
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setStep("otp");
    } catch (e: any) {
      Alert.alert("خطأ", e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 4) return;
    setLoading(true);
    try {
      await verifyOtp(email.trim(), otp.trim());
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (e: any) {
      Alert.alert("خطأ", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Close */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={[styles.closeBtn, { top: insets.top + 12, backgroundColor: colors.card, borderColor: colors.border }]}
      >
        <Feather name="x" size={20} color={colors.foreground} />
      </TouchableOpacity>

      <View style={[styles.inner, { paddingTop: insets.top + 70 }]}>
        {/* Logo */}
        <View style={[styles.logoCircle, { backgroundColor: colors.primary }]}>
          <Feather name="shopping-bag" size={36} color="#fff" />
        </View>
        <Text style={[styles.appName, { color: colors.primary }]}>يو شوب</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>سوق الطلاب الجامعيين</Text>

        {step === "email" && (
          <>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>سجّل دخولك</Text>
            <Text style={[styles.stepSub, { color: colors.mutedForeground }]}>
              أدخل بريدك الجامعي وسنرسل لك رمز تحقق
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
              placeholder="student@university.edu.jo"
              placeholderTextColor={colors.mutedForeground}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              textAlign="left"
              autoFocus
            />
            <TouchableOpacity
              onPress={handleSendOtp}
              disabled={loading || !email.includes("@")}
              style={[styles.primaryBtn, { backgroundColor: loading ? colors.muted : colors.primary }]}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={[styles.primaryBtnText, { color: colors.primaryForeground }]}>إرسال رمز التحقق</Text>
              )}
            </TouchableOpacity>
          </>
        )}

        {step === "otp" && (
          <>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>رمز التحقق</Text>
            <Text style={[styles.stepSub, { color: colors.mutedForeground }]}>
              أُرسل رمز التحقق إلى {email}
            </Text>
            <TextInput
              style={[styles.input, styles.otpInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
              placeholder="• • • • • •"
              placeholderTextColor={colors.mutedForeground}
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
              textAlign="center"
              autoFocus
            />
            <TouchableOpacity
              onPress={handleVerifyOtp}
              disabled={loading || otp.length < 4}
              style={[styles.primaryBtn, { backgroundColor: loading ? colors.muted : colors.primary }]}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={[styles.primaryBtnText, { color: colors.primaryForeground }]}>تأكيد الرمز</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setStep("email")} style={styles.backLink}>
              <Text style={[styles.backLinkText, { color: colors.mutedForeground }]}>تغيير البريد الإلكتروني</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  closeBtn: {
    position: "absolute",
    right: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    zIndex: 10,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: "center",
    gap: 12,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  appName: { fontSize: 28, fontWeight: "900", fontFamily: "Tajawal_900Black" },
  subtitle: { fontSize: 14, fontFamily: "Tajawal_400Regular", marginBottom: 16 },
  stepTitle: { fontSize: 22, fontWeight: "800", fontFamily: "Tajawal_700Bold", textAlign: "center" },
  stepSub: { fontSize: 14, fontFamily: "Tajawal_400Regular", textAlign: "center", marginBottom: 8 },
  input: {
    width: "100%",
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontFamily: "Tajawal_400Regular",
  },
  otpInput: { fontSize: 24, letterSpacing: 6, textAlign: "center" },
  primaryBtn: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  primaryBtnText: { fontSize: 16, fontWeight: "700", fontFamily: "Tajawal_700Bold" },
  backLink: { marginTop: 8 },
  backLinkText: { fontSize: 14, fontFamily: "Tajawal_400Regular" },
});
