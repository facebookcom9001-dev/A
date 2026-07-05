import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Info, FileText, ShieldCheck } from "lucide-react";

export type InfoPageKey = "about" | "terms" | "privacy";

const CONTENT: Record<InfoPageKey, { title: string; icon: React.ReactNode; body: string[] }> = {
  about: {
    title: "عن الموقع",
    icon: <Info className="w-6 h-6" />,
    body: [
      "«Uni Shop» هو سوق رقمي مخصص لطلاب الجامعات الأردنية، بُني ليكون المكان الأول اللي بيقدر فيه أي طالب يبيع، يشتري، أو يتبادل أي شي مع طلاب جامعته أو جامعات ثانية.",
      "من بيع الكتب والأجهزة، لإيجاد سكن أو زميل سكن، لإعلانات الوظائف والفرص الطلابية، لحتى المفقودات — كل شي بمكان واحد وبخصوصية إنه التسجيل يكون فقط عبر البريد الجامعي الرسمي (.edu.jo) لضمان إن المجتمع طلابي بالكامل.",
      "هدفنا نسهّل الحياة الجامعية ونبني مجتمع طلابي موثوق يقدر يتعاون ويتبادل الفائدة بأمان وسهولة.",
    ],
  },
  terms: {
    title: "شروط الاستخدام",
    icon: <FileText className="w-6 h-6" />,
    body: [
      "باستخدامك للمنصة أنت توافق على الشروط التالية:",
      "١. المنصة مخصصة حصراً لطلاب الجامعات الأردنية ممن يملكون بريد جامعي رسمي، ويُمنع انتحال صفة أو استخدام بيانات غير صحيحة.",
      "٢. المستخدم مسؤول بالكامل عن محتوى إعلاناته وصحة المعلومات المذكورة فيها، ويُمنع نشر أي محتوى مخالف للقانون أو الآداب العامة.",
      "٣. المعاملات والبيع والشراء تتم مباشرة بين الطلاب، والمنصة لا تتوسط ماديًا ولا تتحمل مسؤولية أي نزاع ناتج عن التعامل بين الأطراف.",
      "٤. تحتفظ إدارة المنصة بالحق في حذف أي إعلان أو تعليق مخالف، أو تعليق أو حظر أي حساب يخالف هذه الشروط دون إشعار مسبق.",
      "٥. يجوز تحديث هذه الشروط من وقت لآخر، واستمرار استخدامك للمنصة بعد التحديث يُعد موافقة ضمنية عليها.",
    ],
  },
  privacy: {
    title: "سياسة الخصوصية",
    icon: <ShieldCheck className="w-6 h-6" />,
    body: [
      "نحن نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية.",
      "١. نجمع فقط المعلومات الضرورية لتشغيل المنصة: البريد الجامعي، الاسم، الجامعة، وأي بيانات تضيفها بنفسك على ملفك الشخصي أو إعلاناتك.",
      "٢. لا نشارك بياناتك مع أي جهة خارجية، ولا تُستخدم إلا لأغراض تشغيل المنصة وتحسين تجربتك (مثل التحقق من الحساب وعرض الإعلانات).",
      "٣. رمز التحقق (OTP) المُرسل لبريدك يُستخدم فقط لتأكيد ملكيتك للبريد الجامعي عند التسجيل، وله صلاحية محدودة بالوقت.",
      "٤. بإمكانك حذف حسابك أو تعديل بياناتك أو إعلاناتك في أي وقت من خلال إعدادات ملفك الشخصي.",
      "٥. نطبق إجراءات أمان معقولة لحماية بياناتك، لكن ننصح دائمًا بعدم مشاركة معلومات حساسة داخل الإعلانات أو الرسائل.",
    ],
  },
};

export function InfoDialog({ page, onClose }: { page: InfoPageKey | null; onClose: () => void }) {
  if (!page) return null;
  const content = CONTENT[page];
  return (
    <Dialog open={!!page} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="border-4 border-black rounded-none neo-shadow max-w-xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-black">
            {content.icon}
            {content.title}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-right leading-relaxed font-medium">
          {content.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
