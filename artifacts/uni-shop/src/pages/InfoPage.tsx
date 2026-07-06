import { useLocation } from "wouter";
import { ArrowRight, Info, FileText, ShieldCheck } from "lucide-react";

export type InfoPageKey = "about" | "terms" | "privacy";

type InfoPoint = { title: string; text: string };
type InfoContent = { title: string; icon: React.ReactNode; intro: string; points: InfoPoint[] };

const CONTENT: Record<InfoPageKey, InfoContent> = {
  about: {
    title: "عن الموقع",
    icon: <Info className="w-7 h-7 text-white" />,
    intro: "«Uni Shop» هو سوق رقمي مخصص لطلاب الجامعات الأردنية، بُني ليكون المكان الأول اللي بيقدر فيه أي طالب يبيع، يشتري، أو يتبادل أي شي مع طلاب جامعته أو جامعات ثانية.",
    points: [
      {
        title: "بريد جامعي فقط",
        text: "التسجيل يكون فقط عبر البريد الجامعي الرسمي (.edu.jo) لضمان إن المجتمع طلابي بالكامل.",
      },
      {
        title: "كل شي بمكان واحد",
        text: "من بيع الكتب والأجهزة، لإيجاد سكن أو زميل سكن، لإعلانات الوظائف والفرص الطلابية، لحتى المفقودات.",
      },
      {
        title: "هدفنا",
        text: "نسهّل الحياة الجامعية ونبني مجتمع طلابي موثوق يقدر يتعاون ويتبادل الفائدة بأمان وسهولة.",
      },
    ],
  },
  terms: {
    title: "شروط الاستخدام",
    icon: <FileText className="w-7 h-7 text-white" />,
    intro: "باستخدامك للمنصة أنت توافق على الشروط التالية:",
    points: [
      {
        title: "من يقدر يستخدم المنصة",
        text: "المنصة مخصصة حصراً لطلاب الجامعات الأردنية ممن يملكون بريد جامعي رسمي، ويُمنع انتحال صفة أو استخدام بيانات غير صحيحة.",
      },
      {
        title: "مسؤولية المحتوى",
        text: "المستخدم مسؤول بالكامل عن محتوى إعلاناته وصحة المعلومات المذكورة فيها، ويُمنع نشر أي محتوى مخالف للقانون أو الآداب العامة.",
      },
      {
        title: "المعاملات بين الطلاب",
        text: "المعاملات والبيع والشراء تتم مباشرة بين الطلاب، والمنصة لا تتوسط ماديًا ولا تتحمل مسؤولية أي نزاع ناتج عن التعامل بين الأطراف.",
      },
      {
        title: "حق الإدارة",
        text: "تحتفظ إدارة المنصة بالحق في حذف أي إعلان أو تعليق مخالف، أو تعليق أو حظر أي حساب يخالف هذه الشروط دون إشعار مسبق.",
      },
      {
        title: "تحديث الشروط",
        text: "يجوز تحديث هذه الشروط من وقت لآخر، واستمرار استخدامك للمنصة بعد التحديث يُعد موافقة ضمنية عليها.",
      },
    ],
  },
  privacy: {
    title: "سياسة الخصوصية",
    icon: <ShieldCheck className="w-7 h-7 text-white" />,
    intro: "نحن نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية.",
    points: [
      {
        title: "البيانات التي نجمعها",
        text: "نجمع فقط المعلومات الضرورية لتشغيل المنصة: البريد الجامعي، الاسم، الجامعة، وأي بيانات تضيفها بنفسك على ملفك الشخصي أو إعلاناتك.",
      },
      {
        title: "عدم مشاركة البيانات",
        text: "لا نشارك بياناتك مع أي جهة خارجية، ولا تُستخدم إلا لأغراض تشغيل المنصة وتحسين تجربتك (مثل التحقق من الحساب وعرض الإعلانات).",
      },
      {
        title: "رمز التحقق (OTP)",
        text: "رمز التحقق المُرسل لبريدك يُستخدم فقط لتأكيد ملكيتك للبريد الجامعي عند التسجيل، وله صلاحية محدودة بالوقت.",
      },
      {
        title: "التحكم بحسابك",
        text: "بإمكانك حذف حسابك أو تعديل بياناتك أو إعلاناتك في أي وقت من خلال إعدادات ملفك الشخصي.",
      },
      {
        title: "الأمان",
        text: "نطبق إجراءات أمان معقولة لحماية بياناتك، لكن ننصح دائمًا بعدم مشاركة معلومات حساسة داخل الإعلانات أو الرسائل.",
      },
    ],
  },
};

export default function InfoPage({ page }: { page: InfoPageKey }) {
  const [, setLocation] = useLocation();
  const content = CONTENT[page];

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
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

        <div className="p-6 md:p-10">
          <p className="text-right leading-relaxed font-black text-lg mb-8">{content.intro}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {content.points.map((point, i) => (
              <div
                key={i}
                className="border-2 border-black neo-shadow bg-card p-5 text-right hover:-translate-y-1 hover:-translate-x-1 transition-transform"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="flex items-center justify-center w-7 h-7 flex-shrink-0 bg-primary text-white font-black text-sm border-2 border-black">
                    {i + 1}
                  </span>
                  <h3 className="font-black text-base">{point.title}</h3>
                </div>
                <p className="font-medium leading-relaxed text-sm text-muted-foreground">{point.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
