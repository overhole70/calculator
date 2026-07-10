'use client';

import { use, useState } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { getToolBySlug } from '@/lib/tools/tools-data';
import { ToolPageWrapper } from '@/components/tools/ToolPageWrapper';
import { PercentageCalculator } from '@/components/calculators/PercentageCalculator';
import { AgeCalculator } from '@/components/calculators/AgeCalculator';
import { BMICalculator } from '@/components/calculators/BMICalculator';
import { LoanCalculator } from '@/components/calculators/LoanCalculator';
import { LengthConverter } from '@/components/calculators/LengthConverter';
import { TemperatureConverter } from '@/components/calculators/TemperatureConverter';
import { TipCalculator } from '@/components/calculators/TipCalculator';
import { PasswordGenerator } from '@/components/calculators/PasswordGenerator';
import { CompoundInterestCalculator } from '@/components/calculators/CompoundInterestCalculator';
import { GenericCalculator } from '@/components/calculators/GenericCalculator';

interface Props {
  params: Promise<{ slug: string }>;
}

export default function ToolPage({ params }: Props) {
  const { slug } = use(params);
  const { lang } = useI18n();
  const [result, setResult] = useState<string | undefined>(undefined);

  const tool = getToolBySlug(slug);

  if (!tool) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Tool not found</h1>
          <a href="/categories" className="text-indigo-600 hover:underline">← Back to Categories</a>
        </div>
      </div>
    );
  }

  const toolContent = getToolContent(tool.id, lang, setResult);

  return (
    <ToolPageWrapper
      tool={tool}
      result={result}
      faqs={toolContent.faqs}
      howToUse={toolContent.howToUse}
      tips={toolContent.tips}
      examples={toolContent.examples}
    >
      {toolContent.calculator}
    </ToolPageWrapper>
  );
}

function getToolContent(
  toolId: string,
  lang: string,
  setResult: (result: string) => void,
): {
  calculator: React.ReactNode;
  faqs: { q: string; a: string }[];
  howToUse: string[];
  tips: string[];
  examples: string[];
} {
  const isAr = lang === 'ar';
  const isFr = lang === 'fr';

  const L = (ar: string, fr: string, en: string) => isAr ? ar : isFr ? fr : en;

  switch (toolId) {
    case 'percentage':
      return {
        calculator: <PercentageCalculator onResult={setResult} />,
        howToUse: [
          L('اختر نوع الحساب: نسبة من رقم، نسبة التغيير، أو ما هي النسبة؟', 'Choisissez le type de calcul', 'Select the calculation type: percentage of a number, percentage change, or what percentage'),
          L('أدخل القيم المطلوبة في الحقول', 'Entrez les valeurs requises', 'Enter the required values in the input fields'),
          L('اضغط على زر "احسب" للحصول على النتيجة', 'Cliquez sur "Calculer"', 'Press the "Calculate" button to get your result'),
          L('انسخ أو شارك النتيجة حسب الحاجة', 'Copiez ou partagez le résultat', 'Copy or share the result as needed'),
        ],
        tips: [
          L('لحساب الضريبة، استخدم "نسبة من رقم"', 'Pour calculer la TVA, utilisez "% de"', 'To calculate tax, use the "% of" mode'),
          L('لحساب الخصم، اطرح النسبة من 100 أولاً', 'Pour calculer une remise, soustrayez d\'abord le % de 100', 'For discounts, subtract the percentage from 100 first'),
          L('يمكنك استخدام الأعداد العشرية مثل 12.5%', 'Vous pouvez utiliser des décimales comme 12.5%', 'You can use decimal percentages like 12.5%'),
        ],
        examples: [
          L('مثال: 20% من 150 = 30', 'Exemple: 20% de 150 = 30', 'Example: 20% of 150 = 30'),
          L('مثال: زيادة من 100 إلى 120 = 20% ارتفاع', 'Exemple: augmentation de 100 à 120 = 20%', 'Example: increase from 100 to 120 = 20% increase'),
          L('مثال: 50 من 200 = 25%', 'Exemple: 50 sur 200 = 25%', 'Example: 50 is 25% of 200'),
        ],
        faqs: [
          {
            q: L('كيف أحسب نسبة مئوية من رقم؟', 'Comment calculer un pourcentage d\'un nombre?', 'How do I calculate a percentage of a number?'),
            a: L('اضرب الرقم في النسبة المئوية ثم اقسم على 100. مثال: 25% من 80 = (80 × 25) ÷ 100 = 20', 'Multipliez le nombre par le pourcentage et divisez par 100', 'Multiply the number by the percentage and divide by 100. Example: 25% of 80 = (80 × 25) ÷ 100 = 20'),
          },
          {
            q: L('كيف أحسب نسبة التغيير؟', 'Comment calculer la variation en %?', 'How do I calculate percentage change?'),
            a: L('الصيغة: ((القيمة الجديدة - القيمة القديمة) ÷ القيمة القديمة) × 100', 'Formule: ((nouvelle - ancienne) / ancienne) × 100', 'Formula: ((New Value - Old Value) / Old Value) × 100'),
          },
          {
            q: L('ما الفرق بين النسبة المئوية والنقطة المئوية؟', 'Quelle est la différence entre % et point de %?', 'What\'s the difference between percentage and percentage point?'),
            a: L('النقطة المئوية هي الفرق المطلق بين نسبتين، بينما النسبة المئوية تقيس التغيير النسبي', 'Un point de pourcentage est la différence absolue entre deux pourcentages', 'A percentage point is the absolute difference between two percentages, while percentage change measures relative change'),
          },
        ],
      };

    case 'age':
      return {
        calculator: <AgeCalculator onResult={setResult} />,
        howToUse: [
          L('أدخل تاريخ ميلادك في الحقل الأول', 'Entrez votre date de naissance', 'Enter your birth date in the first field'),
          L('حدد تاريخ الحساب (الافتراضي: اليوم)', 'Sélectionnez la date de calcul', 'Select the calculation date (default: today)'),
          L('اضغط "احسب" للحصول على عمرك التفصيلي', 'Cliquez "Calculer"', 'Press "Calculate" for your detailed age'),
        ],
        tips: [
          L('يمكنك حساب العمر في تاريخ مستقبلي أو ماضٍ', 'Vous pouvez calculer l\'âge à une date future ou passée', 'You can calculate age at a future or past date'),
          L('ستعرف كم يوم تبقى على عيد ميلادك القادم', 'Vous saurez combien de jours jusqu\'à votre prochain anniversaire', 'You\'ll see how many days until your next birthday'),
        ],
        examples: [
          L('مثال: شخص ولد في 1 يناير 1990، عمره في 2024 هو 34 سنة', 'Exemple: né le 1 janvier 1990, âge en 2024: 34 ans', 'Example: born January 1, 1990 is 34 years old in 2024'),
          L('مثال: حساب عمر شخص في يوم زفافه', 'Exemple: calculer l\'âge lors du mariage', 'Example: calculate how old someone was on their wedding day'),
        ],
        faqs: [
          {
            q: L('هل الحساب دقيق لأيام السنة الكبيسة؟', 'Le calcul est-il précis pour les années bissextiles?', 'Is the calculation accurate for leap years?'),
            a: L('نعم، الحاسبة تأخذ بعين الاعتبار السنوات الكبيسة (29 فبراير)', 'Oui, le calculateur tient compte des années bissextiles', 'Yes, the calculator accounts for leap years (February 29) accurately'),
          },
          {
            q: L('هل يمكنني حساب عمر أي شخص؟', 'Puis-je calculer l\'âge de n\'importe qui?', 'Can I calculate anyone\'s age?'),
            a: L('نعم، أدخل أي تاريخ ميلاد وستحصل على العمر', 'Oui, entrez n\'importe quelle date de naissance', 'Yes, enter any birth date and you\'ll get the exact age'),
          },
        ],
      };

    case 'bmi':
      return {
        calculator: <BMICalculator onResult={setResult} />,
        howToUse: [
          L('اختر نظام القياس: متري أو إمبريالي', 'Choisissez le système métrique ou impérial', 'Select the measurement system: metric or imperial'),
          L('أدخل وزنك بالكيلوغرام أو الباوند', 'Entrez votre poids', 'Enter your weight in kg or lbs'),
          L('أدخل طولك بالسنتيمتر أو القدم/البوصة', 'Entrez votre taille', 'Enter your height in cm or ft/in'),
          L('اضغط احسب لمعرفة مؤشر كتلة جسمك', 'Cliquez Calculer', 'Press Calculate to find your BMI'),
        ],
        tips: [
          L('BMI طبيعي بين 18.5 و24.9', 'Un IMC normal est entre 18.5 et 24.9', 'Normal BMI range is 18.5 to 24.9'),
          L('BMI وحده لا يكفي لتقييم الصحة الكاملة، استشر طبيبك', 'L\'IMC seul ne suffit pas pour évaluer la santé complète', 'BMI alone is not sufficient for complete health assessment'),
          L('لاعبو كمال الأجسام قد يكون لديهم BMI مرتفع رغم صحتهم الجيدة', 'Les athlètes peuvent avoir un IMC élevé malgré bonne santé', 'Athletes may have high BMI despite being healthy due to muscle mass'),
        ],
        examples: [
          L('مثال: وزن 70 كجم، طول 175 سم → BMI = 22.9 (طبيعي)', 'Exemple: 70 kg, 175 cm → IMC = 22.9 (normal)', 'Example: 70 kg, 175 cm → BMI = 22.9 (Normal)'),
          L('مثال: وزن 90 كجم، طول 170 سم → BMI = 31.1 (سمنة)', 'Exemple: 90 kg, 170 cm → IMC = 31.1 (obésité)', 'Example: 90 kg, 170 cm → BMI = 31.1 (Obese)'),
        ],
        faqs: [
          {
            q: L('ما هو مؤشر كتلة الجسم الطبيعي؟', 'Quel est l\'IMC normal?', 'What is a normal BMI?'),
            a: L('حسب منظمة الصحة العالمية: أقل من 18.5 نقص وزن، 18.5-24.9 طبيعي، 25-29.9 زيادة، 30+ سمنة', 'Selon l\'OMS: <18.5 insuffisant, 18.5-24.9 normal, 25-29.9 surpoids, 30+ obésité', 'According to WHO: Under 18.5 is underweight, 18.5-24.9 is normal, 25-29.9 is overweight, 30+ is obese'),
          },
          {
            q: L('هل BMI ينطبق على جميع الأعمار؟', 'L\'IMC s\'applique-t-il à tous les âges?', 'Does BMI apply to all ages?'),
            a: L('BMI صمم للبالغين. للأطفال، تُستخدم مقاييس مختلفة تأخذ العمر والجنس بعين الاعتبار', 'L\'IMC est conçu pour les adultes. Pour les enfants, des mesures différentes sont utilisées', 'BMI is designed for adults. For children, different age and sex-specific charts are used'),
          },
        ],
      };

    case 'loan':
      return {
        calculator: <LoanCalculator onResult={setResult} />,
        howToUse: [
          L('أدخل مبلغ القرض', 'Entrez le montant du prêt', 'Enter the loan amount'),
          L('أدخل معدل الفائدة السنوي', 'Entrez le taux d\'intérêt annuel', 'Enter the annual interest rate'),
          L('حدد مدة القرض بالسنوات أو الأشهر', 'Sélectionnez la durée en années ou mois', 'Specify the loan term in years or months'),
          L('اضغط احسب لمعرفة القسط الشهري وإجمالي الفائدة', 'Cliquez Calculer', 'Press Calculate to see monthly payment and total interest'),
        ],
        tips: [
          L('القسط الشهري الأقل لا يعني دائمًا التكلفة الأقل', 'Une mensualité plus faible ne signifie pas toujours moins de coût', 'Lower monthly payment doesn\'t always mean lower total cost'),
          L('زيادة الدفع الشهري قليلاً توفر كثيرًا من الفائدة', 'Augmenter légèrement les versements mensuels économise des intérêts', 'Paying a bit more monthly can save significantly on total interest'),
          L('قارن بين عروض متعددة قبل اختيار القرض', 'Comparez plusieurs offres avant de choisir', 'Compare multiple loan offers before deciding'),
        ],
        examples: [
          L('قرض $10,000 بفائدة 5% لمدة 5 سنوات = $188.71 شهريًا', 'Prêt de 10 000$ à 5% sur 5 ans = 188,71$/mois', 'Example: $10,000 loan at 5% for 5 years = $188.71/month'),
          L('قرض $250,000 بفائدة 4% لمدة 30 سنة = $1,193.54 شهريًا', 'Prêt de 250 000$ à 4% sur 30 ans = 1 193,54$/mois', 'Example: $250,000 mortgage at 4% for 30 years = $1,193.54/month'),
        ],
        faqs: [
          {
            q: L('ما الفرق بين الفائدة الثابتة والمتغيرة؟', 'Quelle est la différence entre taux fixe et variable?', 'What\'s the difference between fixed and variable interest rates?'),
            a: L('الفائدة الثابتة تبقى كما هي طوال مدة القرض، بينما المتغيرة قد تتغير بناءً على السوق', 'Le taux fixe reste constant, le taux variable peut changer selon le marché', 'Fixed rate stays constant throughout the loan, variable rate can change based on market conditions'),
          },
          {
            q: L('هل يمكنني سداد القرض مبكرًا؟', 'Puis-je rembourser le prêt par anticipation?', 'Can I pay off the loan early?'),
            a: L('نعم، في معظم الحالات يمكنك السداد المبكر مما يقلل الفائدة الإجمالية، لكن تحقق من شروط عقد القرض', 'Oui, généralement vous pouvez rembourser par anticipation, ce qui réduit les intérêts totaux', 'Yes, in most cases early repayment is possible and reduces total interest, but check your loan terms'),
          },
        ],
      };

    case 'length':
      return {
        calculator: <LengthConverter />,
        howToUse: [
          L('أدخل القيمة المراد تحويلها', 'Entrez la valeur à convertir', 'Enter the value you want to convert'),
          L('اختر وحدة المصدر (من)', 'Choisissez l\'unité source', 'Select the source unit (From)'),
          L('اختر وحدة الهدف (إلى)', 'Choisissez l\'unité cible', 'Select the target unit (To)'),
          L('ستظهر النتيجة تلقائيًا', 'Le résultat apparaîtra automatiquement', 'The result will appear automatically'),
        ],
        tips: [
          L('استخدم زر التبديل لعكس التحويل', 'Utilisez le bouton d\'échange pour inverser la conversion', 'Use the swap button to reverse the conversion'),
          L('يمكنك رؤية جميع التحويلات دفعة واحدة في جدول المرجع السريع', 'Vous pouvez voir toutes les conversions dans le tableau de référence rapide', 'See all conversions at once in the quick reference table'),
        ],
        examples: [
          L('1 ميل = 1.609 كيلومتر', '1 mile = 1,609 km', '1 mile = 1.609 kilometers'),
          L('1 متر = 3.281 قدم = 39.37 بوصة', '1 mètre = 3,281 pieds', '1 meter = 3.281 feet = 39.37 inches'),
          L('1 كيلومتر = 0.621 ميل', '1 km = 0,621 mile', '1 kilometer = 0.621 miles'),
        ],
        faqs: [
          {
            q: L('ما الفرق بين الكيلومتر والميل؟', 'Quelle est la différence entre kilomètre et mile?', 'What\'s the difference between a kilometer and a mile?'),
            a: L('الميل أطول من الكيلومتر. 1 ميل = 1.609 كيلومتر تقريبًا', 'Le mile est plus long que le kilomètre. 1 mile ≈ 1,609 km', 'A mile is longer than a kilometer. 1 mile ≈ 1.609 kilometers'),
          },
          {
            q: L('كيف أحول القدم إلى متر؟', 'Comment convertir des pieds en mètres?', 'How do I convert feet to meters?'),
            a: L('اضرب القيم بالقدم في 0.3048 للحصول على الأمتار', 'Multipliez les pieds par 0,3048 pour obtenir les mètres', 'Multiply feet by 0.3048 to get meters. Example: 5 feet = 5 × 0.3048 = 1.524 meters'),
          },
        ],
      };

    case 'temperature':
      return {
        calculator: <TemperatureConverter />,
        howToUse: [
          L('أدخل درجة الحرارة', 'Entrez la température', 'Enter the temperature value'),
          L('اختر وحدة المصدر', 'Choisissez l\'unité source', 'Select the source unit'),
          L('ستظهر جميع التحويلات تلقائيًا', 'Toutes les conversions apparaissent automatiquement', 'All conversions appear automatically'),
        ],
        tips: [
          L('درجة الحرارة المطلقة (الصفر المطلق) = -273.15°C أو 0 كلفن', 'La température absolue (zéro absolu) = -273,15°C ou 0 Kelvin', 'Absolute zero = -273.15°C or 0 Kelvin'),
          L('درجة الغرفة المريحة تتراوح بين 20-22°C (68-72°F)', 'La température de confort est entre 20-22°C', 'Comfortable room temperature is 20-22°C (68-72°F)'),
        ],
        examples: [
          L('100°C = 212°F (غليان الماء)', '100°C = 212°F (ébullition de l\'eau)', '100°C = 212°F (boiling water)'),
          L('0°C = 32°F (تجمد الماء)', '0°C = 32°F (congélation de l\'eau)', '0°C = 32°F (freezing water)'),
          L('37°C = 98.6°F (حرارة الجسم الطبيعية)', '37°C = 98,6°F (température corporelle)', '37°C = 98.6°F (normal body temperature)'),
        ],
        faqs: [
          {
            q: L('ما الصيغة لتحويل سيلسيوس إلى فهرنهايت؟', 'Quelle est la formule pour Celsius en Fahrenheit?', 'What\'s the formula to convert Celsius to Fahrenheit?'),
            a: L('°F = (°C × 9/5) + 32. مثال: 100°C = (100 × 9/5) + 32 = 212°F', '°F = (°C × 9/5) + 32', '°F = (°C × 9/5) + 32. Example: 100°C = (100 × 9/5) + 32 = 212°F'),
          },
          {
            q: L('ما هي درجة الحرارة المطلقة؟', 'Qu\'est-ce que la température absolue?', 'What is absolute temperature?'),
            a: L('الكلفن هو مقياس الحرارة المطلق. الصفر المطلق (-273.15°C) هو أبرد درجة حرارة ممكنة نظريًا', 'Le Kelvin est l\'échelle de température absolue. Le zéro absolu est la température la plus froide possible', 'Kelvin is the absolute temperature scale. Absolute zero (-273.15°C) is the coldest theoretically possible temperature'),
          },
        ],
      };

    case 'tip':
      return {
        calculator: <TipCalculator onResult={setResult} />,
        howToUse: [
          L('أدخل مبلغ الفاتورة', 'Entrez le montant de la facture', 'Enter the bill amount'),
          L('اضبط نسبة البقشيش حسب رضاك عن الخدمة', 'Ajustez le pourboire selon votre satisfaction', 'Adjust the tip percentage based on your satisfaction'),
          L('أدخل عدد الأشخاص إذا كنت تقسم الفاتورة', 'Entrez le nombre de personnes si vous partagez', 'Enter the number of people if splitting the bill'),
        ],
        tips: [
          L('15-20% بقشيش مناسب في معظم دول العالم', '15-20% est un pourboire approprié dans la plupart des pays', '15-20% is an appropriate tip in most countries'),
          L('في بعض الدول كاليابان، البقشيش ليس عرفًا سائدًا', 'Dans certains pays comme le Japon, le pourboire n\'est pas courant', 'In some countries like Japan, tipping is not customary'),
          L('للخدمة الممتازة، 25% أو أكثر مناسب', 'Pour un excellent service, 25% ou plus est approprié', 'For excellent service, 25% or more is appropriate'),
        ],
        examples: [
          L('فاتورة $50 بقشيش 20% = بقشيش $10 + الإجمالي $60', 'Facture 50$ avec 20% = pourboire 10$ + total 60$', 'Bill of $50 with 20% tip = $10 tip, $60 total'),
          L('فاتورة $120 مقسمة على 4 أشخاص بقشيش 18% = $35.40 للشخص', 'Facture 120$ divisée par 4 avec 18% = 35,40$ par personne', '$120 bill split 4 ways with 18% tip = $35.40 per person'),
        ],
        faqs: [
          {
            q: L('هل يجب حساب البقشيش قبل أو بعد الضريبة؟', 'Faut-il calculer le pourboire avant ou après taxe?', 'Should I calculate tip before or after tax?'),
            a: L('يُفضل حساب البقشيش على المبلغ قبل الضريبة، لكن كلا الطريقتين مقبولتان', 'Il est préférable de calculer le pourboire sur le montant avant taxes', 'It\'s generally preferred to tip on the pre-tax amount, but both methods are acceptable'),
          },
          {
            q: L('ما هي النسبة المناسبة للبقشيش في المطاعم؟', 'Quel est le pourboire approprié au restaurant?', 'What\'s an appropriate tip at a restaurant?'),
            a: L('في الولايات المتحدة: 15-20% عادي، 20-25% ممتاز. في أوروبا: 10-15% كافٍ', 'Aux États-Unis: 15-20% normal, 20-25% excellent. En Europe: 10-15% suffisant', 'In the US: 15-20% standard, 20-25% for excellent service. In Europe: 10-15% is common'),
          },
        ],
      };

    case 'password':
      return {
        calculator: <PasswordGenerator />,
        howToUse: [
          L('حدد طول كلمة المرور', 'Définissez la longueur du mot de passe', 'Set the desired password length'),
          L('اختر أنواع الأحرف: كبيرة، صغيرة، أرقام، رموز', 'Choisissez les types de caractères', 'Choose character types: uppercase, lowercase, numbers, symbols'),
          L('اضغط "إنشاء كلمة مرور" للحصول على كلمة مرور قوية', 'Cliquez "Générer"', 'Press "Generate Password" for a strong password'),
          L('انسخ كلمة المرور وخزّنها في مدير كلمات المرور', 'Copiez et stockez dans un gestionnaire de mots de passe', 'Copy and store in a password manager'),
        ],
        tips: [
          L('استخدم على الأقل 12 حرفًا لكلمة مرور قوية', 'Utilisez au moins 12 caractères pour un mot de passe fort', 'Use at least 12 characters for a strong password'),
          L('لا تعيد استخدام كلمات المرور في مواقع مختلفة', 'Ne réutilisez pas les mots de passe sur différents sites', 'Never reuse passwords across different sites'),
          L('استخدم مدير كلمات مرور مثل 1Password أو Bitwarden', 'Utilisez un gestionnaire comme 1Password ou Bitwarden', 'Use a password manager like 1Password or Bitwarden'),
          L('فعّل المصادقة الثنائية (2FA) عند الإمكان', 'Activez l\'authentification à deux facteurs (2FA)', 'Enable two-factor authentication (2FA) whenever possible'),
        ],
        examples: [
          L('كلمة مرور قصيرة (8 أحرف): متوسطة الأمان', 'Mot de passe court (8 caractères): sécurité moyenne', 'Short password (8 chars): Medium security'),
          L('كلمة مرور متوسطة (12 حرفًا): جيدة', 'Mot de passe moyen (12 caractères): bon', 'Medium password (12 chars): Good security'),
          L('كلمة مرور طويلة (20+ حرفًا): ممتازة', 'Long mot de passe (20+ caractères): excellent', 'Long password (20+ chars): Excellent security'),
        ],
        faqs: [
          {
            q: L('هل كلمات المرور المُنشأة آمنة؟', 'Les mots de passe générés sont-ils sécurisés?', 'Are the generated passwords secure?'),
            a: L('نعم، يتم توليد كلمات المرور بشكل عشوائي في متصفحك ولا تُرسل إلى أي خادم', 'Oui, les mots de passe sont générés aléatoirement dans votre navigateur et ne sont pas envoyés à un serveur', 'Yes, passwords are generated randomly in your browser and never sent to any server'),
          },
          {
            q: L('ما طول كلمة المرور الموصى به؟', 'Quelle longueur de mot de passe est recommandée?', 'What password length is recommended?'),
            a: L('توصي NIST بكلمات مرور لا تقل عن 12 حرفًا، ويُفضل 16+ للحسابات المهمة', 'NIST recommande au moins 12 caractères, idéalement 16+ pour les comptes importants', 'NIST recommends at least 12 characters, ideally 16+ for important accounts'),
          },
        ],
      };

    case 'compound-interest':
      return {
        calculator: <CompoundInterestCalculator onResult={setResult} />,
        howToUse: [
          L('أدخل رأس المال الأولي', 'Entrez le capital initial', 'Enter the principal amount'),
          L('أدخل معدل الفائدة السنوي', 'Entrez le taux d\'intérêt annuel', 'Enter the annual interest rate'),
          L('حدد مدة الاستثمار بالسنوات', 'Définissez la durée en années', 'Set the investment period in years'),
          L('اختر تكرار التركيب (شهري، ربع سنوي...)', 'Choisissez la fréquence de capitalisation', 'Choose compounding frequency'),
        ],
        tips: [
          L('التركيب الشهري يعطي نتيجة أفضل من التركيب السنوي', 'La capitalisation mensuelle donne de meilleurs résultats que la capitalisation annuelle', 'Monthly compounding yields better results than annual compounding'),
          L('البدء مبكرًا في الادخار له تأثير هائل على النتيجة النهائية', 'Commencer à épargner tôt a un impact énorme sur le résultat final', 'Starting to save early has a huge impact on final results'),
          L('حتى إضافة صغيرة شهرية تُحدث فرقًا كبيرًا بمرور الوقت', 'Même une petite contribution mensuelle fait une grande différence', 'Even a small monthly contribution makes a big difference over time'),
        ],
        examples: [
          L('$10,000 بفائدة 7% لـ 30 سنة = $76,122.55', '$10 000 à 7% pendant 30 ans = $76 122,55', '$10,000 at 7% for 30 years = $76,122.55'),
          L('$1,000 شهريًا بفائدة 6% لـ 20 سنة = $462,040', '$1 000/mois à 6% pendant 20 ans = $462 040', '$1,000/month at 6% for 20 years = $462,040'),
        ],
        faqs: [
          {
            q: L('ما هي الفائدة المركبة؟', 'Qu\'est-ce que l\'intérêt composé?', 'What is compound interest?'),
            a: L('الفائدة المركبة هي الفائدة المحسوبة على رأس المال الأصلي وأيضًا على الفوائد المتراكمة السابقة', 'L\'intérêt composé est l\'intérêt calculé sur le principal et sur les intérêts accumulés', 'Compound interest is interest calculated on both the principal and previously accumulated interest'),
          },
          {
            q: L('ما الفرق بين الفائدة البسيطة والمركبة؟', 'Quelle est la différence entre intérêt simple et composé?', 'What\'s the difference between simple and compound interest?'),
            a: L('الفائدة البسيطة تُحسب على رأس المال فقط، بينما المركبة تُحسب على رأس المال + الفوائد المتراكمة', 'L\'intérêt simple est calculé uniquement sur le principal, l\'intérêt composé sur principal + intérêts accumulés', 'Simple interest is calculated only on principal, while compound interest is calculated on principal plus accumulated interest'),
          },
        ],
      };

    default:
      return {
        calculator: <GenericCalculator toolId={toolId} onResult={setResult} />,
        howToUse: [
          L('أدخل القيم المطلوبة', 'Entrez les valeurs requises', 'Enter the required values'),
          L('اضغط احسب للحصول على النتيجة', 'Cliquez Calculer', 'Press Calculate to get the result'),
        ],
        tips: [],
        examples: [],
        faqs: [],
      };
  }
}
