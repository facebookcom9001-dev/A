import { useLocation } from "wouter";
import { ArrowRight, Info, FileText, ShieldCheck } from "lucide-react";

export type InfoPageKey = "about" | "terms" | "privacy";

const CONTENT: Record<InfoPageKey, { title: string; icon: React.ReactNode; body: string[] }> = {
  about: {
    title: "عن الموقع",
    icon: <Info className="w-7 h-7 text-white" />,
    body: [
      "«Uni Shop» هو سوق رقمي مخصص لطلاب الجامعات الأردنية، بُني ليكون المكان الأول اللي بيقدر فيه أي طالب يبيع، يشتري، أو يتبادل أي شي مع طلاب جامعته أو جامعات ثانية.",
      "من بيع الكتب والأجهزة، لإيجاد سكن أو زميل سكن، لإعلانات الوظائف والفرص الطلابية، لحتى المفقودات — كل شي بمكان واحد وبخصوصية إنه التسجيل يكون فقط عبر البريد الجامعي الرسمي (.edu.jo) لضمان إن المجتمع طلابي بالكامل.",
      "هدفنا نسهّل الحياة الجامعية ونبني مجتمع طلابي موثوق يقدر يتعاون ويتبادل الفائدة بأمان وسهولة.",
    ],
  },
  terms: {
    title: "شروط الاستخدام",
    icon: <FileText className="w-7 h-7 text-white" />,
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
    icon: <ShieldCheck className="w-7 h-7 text-white" />,
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

export default function InfoPage({ page }: { page: InfoPageKey }) {
  const [, setLocation] = useLocation();
  const content = CONTENT[page];

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <button
        onClick={() => setLocation("/")}
        className="flex items-center gap-2 font-bold text-sm mb-6 hover:underline"
      >
        <ArrowRight className="w-4 h-4" />
        العودة للرئيسية
      </button>

      <div className="bg-card border-4 border-black neo-shadow">
        <div className="flex items-center gap-3 p-6 border-b-4 border-black bg-primary">
          {content.icon}
          <h1 className="text-2xl md:text-3xl font-display font-black text-white">{content.title}</h1>
        </div>
        <div className="p-6 md:p-10 space-y-4 text-right leading-relaxed font-medium">
          {content.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
