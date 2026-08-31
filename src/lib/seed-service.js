import bcrypt from "bcryptjs";

// Helper to generate 100 syllabus-based questions per exam
export function generate100Questions(examType, examIndex) {
  const questions = [];

  const marathiTopics = [
    {
      template: (i) => ({
        qText: `Identify the correct synonym for the Marathi word '${["सूर्य", "चंद्र", "पृथ्वी", "पाऊस", "समुद्र", "अग्नी", "वारा", "आकाश", "कमळ", "झाड", "सिंह", "हत्ती", "घोडा", "डोळा", "हात", "फूल", "मित्र", "राजा", "घर", "नदी"][i % 20]}'.`,
        qTextMr: `'${["सूर्य", "चंद्र", "पृथ्वी", "पाऊस", "समुद्र", "अग्नी", "वारा", "आकाश", "कमळ", "झाड", "सिंह", "हत्ती", "घोडा", "डोळा", "हात", "फूल", "मित्र", "राजा", "घर", "नदी"][i % 20]}' या शब्दाचा अचूक समानार्थी शब्द कोणता?`,
        options: [
          ["भास्कर / दिनकर", "शशी / सुधाकर", "अवनि / धरणी", "पर्जन्य / वृष्टी", "सागर / रत्नाकर", "पावक / अनल", "पवन / मारुती", "गगन / नभ", "पंकज / राजीव", "वृक्ष / तरु", "केसरी / शार्दूल", "गज / कुंजर", "अश्व / वारू", "नयन / चक्षू", "कर / हस्त", "पुष्प / सुमन", "सखा / सोबती", "नृप / भूपाल", "सदन / गृह", "सरिता / तटिनी"][i % 20],
          "विपिन",
          "कानन",
          "कांता",
        ],
        correct: 0,
        expMr: `या शब्दाचे समानार्थी रूप पर्याय क्रमांक १ आहे.`,
      }),
    },
    {
      template: (i) => ({
        qText: `Identify the compound (Samas) type for the word: '${["प्रतिदिन", "यथाशक्ती", "नीलकंठ", "गजानन", "ज्ञानामृत", "कमलनयन", "भाजीपाला", "पापपुण्य", "त्रिभुवन", "पंचवटी", "आजन्म", "यथामती", "लंबोदर", "चंद्रमुखी", "विद्याधन", "सुवर्णकमळ", "केरकचरा", "खरेखोटे", "चौघडा", "सप्ताह"][i % 20]}'.`,
        qTextMr: `'${["प्रतिदिन", "यथाशक्ती", "नीलकंठ", "गजानन", "ज्ञानामृत", "कमलनयन", "भाजीपाला", "पापपुण्य", "त्रिभुवन", "पंचवटी", "आजन्म", "यथामती", "लंबोदर", "चंद्रमुखी", "विद्याधन", "सुवर्णकमळ", "केरकचरा", "खरेखोटे", "चौघडा", "सप्ताह"][i % 20]}' या सामासिक शब्दाचा समास कोणता?`,
        options: [
          ["अव्ययीभाव समास", "अव्ययीभाव समास", "बहुव्रीही समास", "बहुव्रीही समास", "कर्मधारय समास", "कर्मधारय समास", "समाहार द्वंद्व समास", "वैकल्पिक द्वंद्व समास", "द्विगु समास", "द्विगु समास", "अव्ययीभाव समास", "अव्ययीभाव समास", "बहुव्रीही समास", "कर्मधारय समास", "कर्मधारय समास", "कर्मधारय समास", "समाहार द्वंद्व समास", "वैकल्पिक द्वंद्व समास", "द्विगु समास", "द्विगु समास"][i % 20],
          "तत्पुरुष समास",
          "मध्यमपदलोपी समास",
          "इतरेतर द्वंद्व समास",
        ],
        correct: 0,
        expMr: `हा शब्द नियमानुसार सामासिक समासाचे अचूक उदाहरण आहे.`,
      }),
    },
    {
      template: (i) => ({
        qText: `Choose the correct meaning of the Marathi proverb / idiom: '${["उंटावरून शेळ्या हाकणे", "काखेत कळसा गावाला वळसा", "अतिशहाणा त्याचा बैल रिकामा", "उथळ पाण्याला खळखळाट फार", "गरज सरो वैद्य मरो", "नाव मोठे लक्षण खोटे", "पालथ्या घड्यावर पाणी", "रात्र थोडी सोंगं फार", "हाताची घडी तोंडावर बोट", "हातचे सोडून पळत्याच्या पाठी लागणे", "आंधळा मागतो एक डोळा देव देतो दोन", "इच्छा तिथे मार्ग", "उतावळा नवरा गुडघ्याला बाशिंग", "एका हाताने टाळी वाजत नाही", "कोल्ह्याला द्राक्षे आंबट", "घरोघरी मातीच्याच चुली", "चोराच्या उलट्या बोंबा", "झाकली मूठ सव्वा लाखाची", "दाम करी काम", "नाचता येईना अंगण वाकडे"][i % 20]}'.`,
        qTextMr: `'${["उंटावरून शेळ्या हाकणे", "काखेत कळसा गावाला वळसा", "अतिशहाणा त्याचा बैल रिकामा", "उथळ पाण्याला खळखळाट फार", "गरज सरो वैद्य मरो", "नाव मोठे लक्षण खोटे", "पालथ्या घड्यावर पाणी", "रात्र थोडी सोंगं फार", "हाताची घडी तोंडावर बोट", "हातचे सोडून पळत्याच्या पाठी लागणे", "आंधळा मागतो एक डोळा देव देतो दोन", "इच्छा तिथे मार्ग", "उतावळा नवरा गुडघ्याला बाशिंग", "एका हाताने टाळी वाजत नाही", "कोल्ह्याला द्राक्षे आंबट", "घरोघरी मातीच्याच चुली", "चोराच्या उलट्या बोंबा", "झाकली मूठ सव्वा लाखाची", "दाम करी काम", "नाचता येईना अंगण वाकडे"][i % 20]}' या म्हणीचा / वाक्प्रचाराचा अचूक अर्थ कोणता?`,
        options: [
          ["प्रत्यक्ष काम न करता दुरूनच सूचना देणे", "जवळची वस्तू सोडून दूर शोधणे", "अति हुशारीमुळे नुकसान होणे", "अंगी कमी गुण असलेला मनुष्य जास्त बडबड करतो", "काम संपताच उपकारकर्त्याला विसरणे", "बाहेरून चांगले दिसणे पण प्रत्यक्षात वाईट असणे", "केलेला उपदेश वाया जाणे", "वेळ कमी आणि कामे खूप असणे", "शांत बसणे", "निश्चित लाभ सोडून अनिश्चित गोष्टीच्या मागे लागणे", "अपेक्षेपेक्षा जास्त लाभ होणे", "तीव्र इच्छा असेल तर मार्ग निघतो", "अतिशय उतावीळ होणे", "दोन्ही बाजूंचा दोष असणे", "न मिळालेल्या गोष्टीला नावे ठेवणे", "सर्वत्र सारखीच परिस्थिती असणे", "स्वतः चूक करून दुसऱ्याला दोष देणे", "गुपित उघड न करणे", "पैशाने सर्व कामे साध्य होतात", "स्वतःतील उणीव लपवण्यासाठी दुसऱ्या वस्तूला दोष देणे"][i % 20],
          "फार मोठी मदत करणे",
          "अतिशय आळशी असणे",
          "कोणतेही काम न करणे",
        ],
        correct: 0,
        expMr: `या म्हणीचा / वाक्प्रचाराचा लोकमान्य अर्थ पर्याय क्रमांक १ आहे.`,
      }),
    },
  ];

  const englishTopics = [
    {
      template: (i) => ({
        qText: `Choose the correct Antonym for the word: '${["TRANSPARENT", "OBSTINATE", "BENEVOLENT", "OPTIMISTIC", "AUTHENTIC", "DILIGENT", "EPHEMERAL", "FUTILE", "GREGARIOUS", "HOSTILE", "ABUNDANT", "CANDID", "DESPAIR", "ELEGANT", "FRUGAL", "GENUINE", "HARMONY", "INNOCENT", "JUBILANT", "KEEN"][i % 20]}'.`,
        qTextMr: `'${["TRANSPARENT", "OBSTINATE", "BENEVOLENT", "OPTIMISTIC", "AUTHENTIC", "DILIGENT", "EPHEMERAL", "FUTILE", "GREGARIOUS", "HOSTILE", "ABUNDANT", "CANDID", "DESPAIR", "ELEGANT", "FRUGAL", "GENUINE", "HARMONY", "INNOCENT", "JUBILANT", "KEEN"][i % 20]}' या इंग्रजी शब्दाचा योग्य विरुद्धार्थी शब्द निवडा.`,
        options: [
          ["Opaque", "Flexible", "Malevolent", "Pessimistic", "Spurious / Fake", "Lazy", "Permanent / Eternal", "Fruitful / Useful", "Introverted / Reclusive", "Friendly / Amiable", "Scarce", "Deceitful", "Hope", "Clumsy", "Extravagant", "Fake", "Conflict", "Guilty", "Depressed", "Dull / Reluctant"][i % 20],
          "Lucid",
          "Generous",
          "Static",
        ],
        correct: 0,
        expMr: `The direct antonym is given in option 1.`,
      }),
    },
    {
      template: (i) => ({
        qText: `Select the correct One Word Substitution for: '${["A person who loves books", "One who does not believe in God", "A life history written by oneself", "A person who looks at the bright side of things", "A place where coins are made", "One who knows everything", "A medicine that counters poison", "One who eats everything (both plants and meat)", "A person who cannot make a mistake", "A speech made without preparation"][i % 10]}'.`,
        qTextMr: `'${["A person who loves books", "One who does not believe in God", "A life history written by oneself", "A person who looks at the bright side of things", "A place where coins are made", "One who knows everything", "A medicine that counters poison", "One who eats everything (both plants and meat)", "A person who cannot make a mistake", "A speech made without preparation"][i % 10]}' यासाठी अचूक इंग्रजी शब्द कोणता?`,
        options: [
          ["Bibliophile", "Atheist", "Autobiography", "Optimist", "Mint", "Omniscient", "Antidote", "Omnivore", "Infallible", "Extempore"][i % 10],
          "Philanthropist",
          "Polyglot",
          "Monologue",
        ],
        correct: 0,
        expMr: `Correct one-word substitute is option 1.`,
      }),
    },
  ];

  const mathsTopics = [
    {
      template: (i) => {
        const p = 1000 + (i % 20) * 250;
        const r = 5 + (i % 6);
        const t = 2 + (i % 4);
        const si = (p * r * t) / 100;
        return {
          qText: `Calculate the Simple Interest on ₹${p} at ${r}% per annum for ${t} years.`,
          qTextMr: `₹${p} मुद्दलावर दरसाल दरशेकडा ${r} दराने ${t} वर्षांचे सरळव्याज किती होईल?`,
          options: [`₹${si}`, `₹${si + 50}`, `₹${si - 50}`, `₹${si + 100}`],
          correct: 0,
          expMr: `सरळव्याज = (मुद्दल × दर × काळ) / १०० = (${p} × ${r} × ${t}) / १०० = ₹${si}.`,
        };
      },
    },
    {
      template: (i) => {
        const cp = 200 + (i % 20) * 30;
        const profitPct = 10 + (i % 5) * 5;
        const sp = cp + (cp * profitPct) / 100;
        return {
          qText: `A shopkeeper buys an article for ₹${cp} and sells it at a profit of ${profitPct}%. What is the Selling Price?`,
          qTextMr: `एका वस्तूची खरेदी किंमत ₹${cp} आहे. ती ${profitPct}% नफ्याने विकल्यास तिची विक्री किंमत किती होईल?`,
          options: [`₹${sp}`, `₹${sp + 20}`, `₹${sp - 15}`, `₹${sp + 30}`],
          correct: 0,
          expMr: `विक्री किंमत = खरेदी + नफा = ${cp} + (${cp} × ${profitPct} / १००) = ₹${sp}.`,
        };
      },
    },
    {
      template: (i) => {
        const speed = 36 + (i % 8) * 18;
        const ms = (speed * 5) / 18;
        return {
          qText: `Convert a speed of ${speed} km/h into metres per second (m/s).`,
          qTextMr: `${speed} किमी/तास या वेगाचे मीटर/सेकंद (m/s) मध्ये रूपांतर किती होईल?`,
          options: [`${ms} m/s`, `${ms + 2} m/s`, `${ms - 3} m/s`, `${ms + 5} m/s`],
          correct: 0,
          expMr: `किमी/तास ते मी/से करण्यासाठी ५/१८ ने गुणावे: ${speed} × ५/१८ = ${ms} मी/से.`,
        };
      },
    },
    {
      template: (i) => {
        const a = 10 + (i % 6);
        const b = 15 + (i % 6);
        const ans = ((a * b) / (a + b)).toFixed(1);
        return {
          qText: `A can complete a work in ${a} days, and B can complete it in ${b} days. How many days will they take together?`,
          qTextMr: `'अ' एक काम ${a} दिवसांत करतो, आणि 'ब' तेच काम ${b} दिवसांत करतो. दोघे मिळून ते काम किती दिवसांत पूर्ण करतील?`,
          options: [`${ans} दिवस`, `${(Number(ans) + 1).toFixed(1)} दिवस`, `${(Number(ans) - 1).toFixed(1)} दिवस`, `${(Number(ans) + 2).toFixed(1)} दिवस`],
          correct: 0,
          expMr: `एकत्रित कामाचे दिवस = (अ × ब) / (अ + ब) = (${a} × ${b}) / (${a} + ${b}) = ${ans} दिवस.`,
        };
      },
    },
  ];

  const reasoningTopics = [
    {
      template: (i) => {
        const start = 2 + (i % 10);
        const diff = 3 + (i % 7);
        const s = [start, start + diff, start + 2 * diff, start + 3 * diff, start + 4 * diff];
        const next = start + 5 * diff;
        return {
          qText: `Find the next number in the sequence: ${s.join(", ")}, ?`,
          qTextMr: `संख्या मालिकेतील पुढील पद ओळखा: ${s.join(", ")}, ?`,
          options: [`${next}`, `${next + 2}`, `${next - 1}`, `${next + 4}`],
          correct: 0,
          expMr: `फरक समान (+${diff}) आहे. म्हणून पुढील पद ${next} येईल.`,
        };
      },
    },
    {
      template: (i) => {
        const base = 2 + (i % 8);
        const s = [base, base * 2, base * 4, base * 8, base * 16];
        const next = base * 32;
        return {
          qText: `Complete the geometric series: ${s.join(", ")}, ?`,
          qTextMr: `संख्या मालिका पूर्ण करा: ${s.join(", ")}, ?`,
          options: [`${next}`, `${next + 4}`, `${next - 8}`, `${next + 12}`],
          correct: 0,
          expMr: `प्रत्येक पद मागील पदाच्या दुप्पट (× २) आहे. म्हणून ${base * 16} × २ = ${next}.`,
        };
      },
    },
  ];

  const gkTopics = [
    {
      template: (i) => ({
        qText: `Where is the headquarters of '${["ISRO", "Reserve Bank of India (RBI)", "Bhabha Atomic Research Centre (BARC)", "National Defence Academy (NDA)", "High Court of Bombay", "Maharashtra Police Academy", "Central Railway", "Sahitya Akademi", "NITI Aayog", "Election Commission of India", "DRDO", "SEBI", "LIC of India", "NABARD", "BCCI", "SBI", "UPSC", "State Election Commission (MH)", "YASHADA", "MPSC"][i % 20]}' located?`,
        qTextMr: `'${["इस्रो (ISRO)", "भारतीय रिझर्व्ह बँक (RBI)", "भाभा अणुसंशोधन केंद्र (BARC)", "राष्ट्रीय संरक्षण प्रबोधिनी (NDA)", "मुंबई उच्च न्यायालय", "महाराष्ट्र पोलीस अकादमी (MPA)", "मध्य रेल्वे मुख्यालय", "साहित्य अकादमी", "नीती आयोग (NITI Aayog)", "भारतीय निवडणूक आयोग", "डीआरडीओ (DRDO)", "सेबी (SEBI)", "भारतीय आयुर्विमा महामंडळ (LIC)", "नाबार्ड (NABARD)", "बीसीसीआय (BCCI)", "भारतीय स्टेट बँक (SBI)", "केंद्रीय लोकसेवा आयोग (UPSC)", "राज्य निवडणूक आयोग (महाराष्ट्र)", "यशदा (YASHADA)", "महाराष्ट्र लोकसेवा आयोग (MPSC)"][i % 20]}' चे मुख्यालय कोठे आहे?`,
        options: [
          ["बंगळुरू (Bengaluru)", "मुंबई (Mumbai)", "तुर्भे / मुंबई (Mumbai)", "खडकवासला, पुणे (Pune)", "मुंबई (Mumbai)", "नाशिक (Nashik)", "सीएसएमटी, मुंबई (Mumbai)", "नवी दिल्ली (New Delhi)", "नवी दिल्ली (New Delhi)", "नवी दिल्ली (New Delhi)", "नवी दिल्ली (New Delhi)", "मुंबई (Mumbai)", "मुंबई (Mumbai)", "मुंबई (Mumbai)", "मुंबई (Mumbai)", "मुंबई (Mumbai)", "नवी दिल्ली (New Delhi)", "मुंबई (Mumbai)", "पुणे (Pune)", "मुंबई (Mumbai)"][i % 20],
          "कोलकाता",
          "हैदराबाद",
          "चेन्नई",
        ],
        correct: 0,
        expMr: `सदर संस्थेचे अधिकृत मुख्यालय पर्याय क्रमांक १ आहे.`,
      }),
    },
    {
      template: (i) => ({
        qText: `Who among the following was associated with '${["सत्यशोधक समाज (१८७३)", "प्रार्थना समाज (१८६७)", "आर्य समाज (१८७५)", "रामकृष्ण मिशन (१८९७)", "मुलींची पहिली शाळा, पुणे (१८४८)", "अखिल भारतीय अस्पृश्यता निवारण परिषद", "शारदा सदन", "भारत सेवक समाज (१९०५)", "बहिष्कृत हितकारिणी सभा (१९२४)", "अभिनव भारत (१९०४)", "रयत शिक्षण संस्था (१९१९)", "मुकनायक पाक्षिक (१९२०)", "केसरी व मराठा वृत्तपत्र (१८८१)", "निबंधमाला (१८७४)", "स्त्री विचारवंती सभा", "सुधारक वृत्तपत्र (१८८८)", "आनंदवन प्रकल्प", "ज्ञानोदय वृत्तपत्र", "हितकारिणी सभा", "होमरूल चळवळ"][i % 20]}'?`,
        qTextMr: `'${["सत्यशोधक समाज (१८७३)", "प्रार्थना समाज (१८६७)", "आर्य समाज (१८७५)", "रामकृष्ण मिशन (१८९७)", "मुलींची पहिली शाळा, पुणे (१८४८)", "अखिल भारतीय अस्पृश्यता निवारण परिषद", "शारदा सदन", "भारत सेवक समाज (१९०५)", "बहिष्कृत हितकारिणी सभा (१९२४)", "अभिनव भारत (१९०४)", "रयत शिक्षण संस्था (१९१९)", "मुकनायक पाक्षिक (१९२०)", "केसरी व मराठा वृत्तपत्र (१८८१)", "निबंधमाला (१८७४)", "स्त्री विचारवंती सभा", "सुधारक वृत्तपत्र (१८८८)", "आनंदवन प्रकल्प", "ज्ञानोदय वृत्तपत्र", "हितकारिणी सभा", "होमरूल चळवळ"][i % 20]}' च्या स्थापनेशी कोण संबंधित आहेत?`,
        options: [
          ["महात्मा ज्योतिराव फुले", "डॉ. आत्माराम पांडुरंग तर्खडकर", "स्वामी दयानंद सरस्वती", "स्वामी विवेकानंद", "सावित्रीबाई व जोतीराव फुले", "महर्षी विठ्ठल रामजी शिंदे", "पंडिता रमाबाई", "गोपाळ कृष्ण गोखले", "डॉ. बाबासाहेब आंबेडकर", "स्वातंत्र्यवीर वि. दा. सावरकर", "कर्मवीर भाऊराव पाटील", "डॉ. बाबासाहेब आंबेडकर", "लोकमान्य टिळक व आगरकर", "विष्णूशास्त्री चिपळूणकर", "सावित्रीबाई फुले", "गोपाळ गणेश आगरकर", "बाबा आमटे", "रेव्हरंड टिळक", "डॉ. आंबेडकर", "लोकमान्य टिळक व ॲनी बेझंट"][i % 20],
          "दादाभाई नौरोजी",
          "फिरोजशाह मेहता",
          "सुरेंद्रनाथ बॅनर्जी",
        ],
        correct: 0,
        expMr: `महाराष्ट्राच्या व भारताच्या समाजसुधारणेत यांचे मोलाचे योगदान आहे.`,
      }),
    },
    {
      template: (i) => ({
        qText: `In which district of Maharashtra is '${["कळसूबाई शिखर", "लोणार सरोवर", "अजिंठा-वेरूळ लेणी", "ताडोबा राष्ट्रीय उद्यान", "पेंच राष्ट्रीय उद्यान", "महाबळेश्वर थंड हवेचे ठिकाण", "माथेरान थंड हवेचे ठिकाण", "चिखलदरा थंड हवेचे ठिकाण", "जायकवाडी धरण (नाथसागर)", "कोयना धरण (शिवसागर)", "राधानगरी धरण", "उजनी धरण", "भंडारदरा धरण", "तोतलाडोह धरण", "मुळा धरण", "इगतपुरी थंड हवेचे ठिकाण", "तोरणमाळ पठार", "पन्हाळा किल्ला", "रायगड किल्ला", "सिंधुदुर्ग सागरी किल्ला"][i % 20]}' located?`,
        qTextMr: `'${["कळसूबाई शिखर", "लोणार सरोवर", "अजिंठा-वेरूळ लेणी", "ताडोबा राष्ट्रीय उद्यान", "पेंच राष्ट्रीय उद्यान", "महाबळेश्वर थंड हवेचे ठिकाण", "माथेरान थंड हवेचे ठिकाण", "चिखलदरा थंड हवेचे ठिकाण", "जायकवाडी धरण (नाथसागर)", "कोयना धरण (शिवसागर)", "राधानगरी धरण", "उजनी धरण", "भंडारदरा धरण", "तोतलाडोह धरण", "मुळा धरण", "इगतपुरी थंड हवेचे ठिकाण", "तोरणमाळ पठार", "पन्हाळा किल्ला", "रायगड किल्ला", "सिंधुदुर्ग सागरी किल्ला"][i % 20]}' महाराष्ट्रातील कोणत्या जिल्ह्यात स्थित आहे?`,
        options: [
          ["अहमदनगर (अकोले)", "बुलढाणा", "छत्रपती संभाजीनगर", "चंद्रपूर", "नागपूर", "सातारा", "रायगड", "अमरावती", "छत्रपती संभाजीनगर (पैठण)", "सातारा", "कोल्हापूर", "सोलापूर", "अहमदनगर", "नागपूर", "अहमदनगर", "नाशिक", "नंदुरबार", "कोल्हापूर", "रायगड", "सिंधुदुर्ग (मालवण)"][i % 20],
          "पुणे",
          "ठाणे",
          "सांगली",
        ],
        correct: 0,
        expMr: `महाराष्ट्राच्या भूगोलानुसार हे ठिकाण पर्याय १ च्या जिल्ह्यात आहे.`,
      }),
    },
  ];

  for (let qNum = 1; qNum <= 100; qNum++) {
    const seedOffset = examIndex * 100 + qNum;
    let chosenSubject = "general-knowledge";
    let qData = null;

    if (qNum <= 25) {
      chosenSubject = "marathi";
      const topic = marathiTopics[qNum % marathiTopics.length];
      qData = topic.template(seedOffset);
    } else if (qNum <= 50) {
      if (examType.includes("POLICE")) {
        chosenSubject = "mathematics";
        const topic = mathsTopics[qNum % mathsTopics.length];
        qData = topic.template(seedOffset);
      } else {
        chosenSubject = "english";
        const topic = englishTopics[qNum % englishTopics.length];
        qData = topic.template(seedOffset);
      }
    } else if (qNum <= 75) {
      chosenSubject = "reasoning";
      const topic = reasoningTopics[qNum % reasoningTopics.length];
      qData = topic.template(seedOffset);
    } else {
      chosenSubject = "general-knowledge";
      const topic = gkTopics[qNum % gkTopics.length];
      qData = topic.template(seedOffset);
    }

    const options = [
      { text: qData.options[0], isCorrect: true },
      { text: qData.options[1], isCorrect: false },
      { text: qData.options[2], isCorrect: false },
      { text: qData.options[3], isCorrect: false },
    ];

    questions.push({
      qNum,
      subject: chosenSubject,
      qText: `[Q${qNum}] ${qData.qText}`,
      qTextMr: `[प्रश्न ${qNum}] ${qData.qTextMr}`,
      options,
      expMr: qData.expMr,
    });
  }

  return questions;
}

export async function runCompleteDatabaseSeed(prismaClient) {
  const org = await prismaClient.organization.upsert({
    where: { slug: "shivneri-academy" },
    update: {},
    create: {
      name: "Shivneri Competitive Academy",
      slug: "shivneri-academy",
      email: "academy@example.com",
      phone: "9876543210",
      district: "Pune",
      state: "Maharashtra",
      subscriptionPlan: "PROFESSIONAL",
    },
  });

  const passwordHash = await bcrypt.hash("demo123", 12);

  const bhavishAdmin = await prismaClient.user.upsert({
    where: { email: "bhavishm009@gmail.com" },
    update: { role: "SUPER_ADMIN", passwordHash },
    create: {
      name: "Bhavish (Super Admin)",
      email: "bhavishm009@gmail.com",
      passwordHash,
      role: "SUPER_ADMIN",
    },
  });

  await prismaClient.user.upsert({
    where: { email: "admin@example.com" },
    update: { role: "SUPER_ADMIN", passwordHash },
    create: {
      name: "Platform Admin",
      email: "admin@example.com",
      passwordHash,
      role: "SUPER_ADMIN",
    },
  });

  await prismaClient.user.upsert({
    where: { email: "academy@example.com" },
    update: { passwordHash, organizationId: org.id },
    create: {
      name: "Prof. Rajesh Deshmukh",
      email: "academy@example.com",
      passwordHash,
      role: "COACHING_ADMIN",
      organizationId: org.id,
    },
  });

  await prismaClient.user.upsert({
    where: { email: "student@example.com" },
    update: { passwordHash },
    create: {
      name: "Rahul Patil",
      email: "student@example.com",
      passwordHash,
      role: "STUDENT",
      studentProfile: {
        create: {
          targetExam: "Maharashtra Police Bharti & Talathi",
          education: "Graduate",
          district: "Pune",
          taluka: "Haveli",
        },
      },
    },
  });

  const subjectsData = [
    { name: "Marathi Grammar", nameMr: "मराठी व्याकरण व शब्दसंग्रह", slug: "marathi" },
    { name: "English Language", nameMr: "इंग्रजी व्याकरण (English)", slug: "english" },
    { name: "Mathematics", nameMr: "अंकगणित व संख्याशास्त्र", slug: "mathematics" },
    { name: "Logical Reasoning", nameMr: "बुद्धिमत्ता चाचणी व तर्कक्षमता", slug: "reasoning" },
    { name: "Maharashtra & India GK", nameMr: "सामान्य ज्ञान (GK & GS)", slug: "general-knowledge" },
    { name: "Current Affairs", nameMr: "चालू घडामोडी", slug: "current-affairs" },
    { name: "History of Maharashtra", nameMr: "महाराष्ट्राचा इतिहास", slug: "history" },
    { name: "Geography of Maharashtra", nameMr: "महाराष्ट्राचा भूगोल", slug: "geography" },
    { name: "Indian Polity & Constitution", nameMr: "भारतीय राज्यघटना व पंचायत राज", slug: "constitution" },
    { name: "General Science", nameMr: "सामान्य विज्ञान", slug: "science" },
  ];

  const subjectMap = {};
  for (const s of subjectsData) {
    const rec = await prismaClient.subject.upsert({
      where: { slug: s.slug },
      update: { name: s.name, nameMr: s.nameMr },
      create: { name: s.name, nameMr: s.nameMr, slug: s.slug },
    });
    subjectMap[s.slug] = rec.id;
  }

  const examsMeta = [
    ...Array.from({ length: 10 }, (_, i) => ({
      title: `Maharashtra Police Bharti 2025 Grand Mock Test ${String(i + 1).padStart(2, "0")} (महाराष्ट्र पोलीस शिपाई सराव परीक्षा - ${String(i + 1).padStart(2, "0")})`,
      slug: `police-bharti-mock-${String(i + 1).padStart(2, "0")}`,
      examType: "POLICE_BHARTI",
      durationMinutes: 90,
      passingMarks: 40,
      negativeMarks: 0,
      description: `महाराष्ट्र पोलीस शिपाई व चालक भरती २०२५ सराव संच क्रमांक ${i + 1} - १०० गुणांची मोफत ऑनलाइन टेस्ट.`,
    })),
    ...Array.from({ length: 5 }, (_, i) => ({
      title: `Maharashtra Talathi Bharti Grand Mock Test ${String(i + 1).padStart(2, "0")} (तलाठी भरती सराव परीक्षा - ${String(i + 1).padStart(2, "0")})`,
      slug: `talathi-mock-${String(i + 1).padStart(2, "0")}`,
      examType: "TALATHI",
      durationMinutes: 120,
      passingMarks: 45,
      negativeMarks: 0,
      description: `TCS पॅटर्ननुसार तलाठी भरती १०० प्रश्नांचा संपूर्ण सराव पेपर ${i + 1}.`,
    })),
    ...Array.from({ length: 2 }, (_, i) => ({
      title: `MPSC Rajyaseva GS Paper 1 Prelims Grand Mock ${String(i + 1).padStart(2, "0")} (राज्यसेवा पूर्व परीक्षा सामान्य अध्ययन)`,
      slug: `mpsc-rajyaseva-mock-${String(i + 1).padStart(2, "0")}`,
      examType: "MPSC_RAJYASEVA",
      durationMinutes: 120,
      passingMarks: 50,
      negativeMarks: 0.25,
      description: `एमपीएससी राज्यसेवा पूर्व परीक्षा सामान्य अध्ययन १०० वस्तुनिष्ठ प्रश्न - संच ${i + 1}.`,
    })),
    ...Array.from({ length: 2 }, (_, i) => ({
      title: `MPSC Group B & C (Combine) Prelims Grand Mock ${String(i + 1).padStart(2, "0")} (संयुक्त पूर्व परीक्षा गट ब व क)`,
      slug: `mpsc-combine-mock-${String(i + 1).padStart(2, "0")}`,
      examType: "MPSC_COMBINE",
      durationMinutes: 60,
      passingMarks: 45,
      negativeMarks: 0.25,
      description: `एमपीएससी गट ब व गट क संयुक्त पूर्व परीक्षेसाठी १०० प्रश्नांची सराव टेस्ट ${i + 1}.`,
    })),
    ...Array.from({ length: 2 }, (_, i) => ({
      title: `Zilla Parishad (ZP) Arogya Sevak & Gramsevak Grand Test ${String(i + 1).padStart(2, "0")} (जिल्हा परिषद भरती विशेष)`,
      slug: `zp-gramsevak-mock-${String(i + 1).padStart(2, "0")}`,
      examType: "ZILLA_PARISHAD",
      durationMinutes: 90,
      passingMarks: 40,
      negativeMarks: 0,
      description: `जिल्हा परिषद अंतर्गत आरोग्य सेवक व ग्रामसेवक १०० प्रश्नांचा सराव संच ${i + 1}.`,
    })),
    ...Array.from({ length: 2 }, (_, i) => ({
      title: `Maharashtra Vanrakshak (Forest Guard) Grand CBT Mock ${String(i + 1).padStart(2, "0")} (वनरक्षक भरती सराव परीक्षा)`,
      slug: `vanrakshak-mock-${String(i + 1).padStart(2, "0")}`,
      examType: "VANRAKSHAK",
      durationMinutes: 90,
      passingMarks: 45,
      negativeMarks: 0,
      description: `वनरक्षक भरती १०० प्रश्न - पर्यावरण, वने, जैवविविधता व भूगोल - संच ${i + 1}.`,
    })),
    ...Array.from({ length: 2 }, (_, i) => ({
      title: `Saralseva Marathi Grammar & GK 100-Question Master Test ${String(i + 1).padStart(2, "0")} (सरळसेवा विशेष १०० प्रश्न)`,
      slug: `saralseva-gk-marathi-${String(i + 1).padStart(2, "0")}`,
      examType: "SARALSEVA",
      durationMinutes: 90,
      passingMarks: 40,
      negativeMarks: 0,
      description: `सरळसेवा भरती १०० गुणांचा मास्टर सराव पेपर ${i + 1}.`,
    })),
    ...Array.from({ length: 2 }, (_, i) => ({
      title: `TCS / IBPS Quantitative Aptitude & Reasoning 100-Question Grand Mock ${String(i + 1).padStart(2, "0")} (अंकगणित व बुद्धिमत्ता विशेष)`,
      slug: `tcs-ibps-maths-reasoning-${String(i + 1).padStart(2, "0")}`,
      examType: "SARALSEVA",
      durationMinutes: 90,
      passingMarks: 40,
      negativeMarks: 0,
      description: `TCS व IBPS पॅटर्नवरील अंकगणित व बुद्धिमत्ता १०० प्रश्नांचा महासराव संच ${i + 1}.`,
    })),
  ];

  for (let idx = 0; idx < examsMeta.length; idx++) {
    const meta = examsMeta[idx];
    const questions100 = generate100Questions(meta.examType, idx);

    const exam = await prismaClient.exam.upsert({
      where: { slug: meta.slug },
      update: {
        title: meta.title,
        status: "LIVE",
        isFree: true,
        visibilityMode: "FREE_GLOBAL",
        price: 0,
        durationMinutes: meta.durationMinutes,
        passingScore: meta.passingMarks,
        totalQuestions: 100,
        totalMarks: 100,
        negativeMarks: meta.negativeMarks,
        examType: meta.examType,
        description: meta.description,
      },
      create: {
        title: meta.title,
        slug: meta.slug,
        examType: meta.examType,
        durationMinutes: meta.durationMinutes,
        totalQuestions: 100,
        totalMarks: 100,
        passingScore: meta.passingMarks,
        negativeMarks: meta.negativeMarks,
        isFree: true,
        price: 0,
        visibilityMode: "FREE_GLOBAL",
        status: "LIVE",
        createdBy: bhavishAdmin.id,
        description: meta.description,
      },
    });

    await prismaClient.examQuestion.deleteMany({
      where: { examId: exam.id },
    });

    for (const q of questions100) {
      const subjectId = subjectMap[q.subject] || subjectMap["general-knowledge"];

      const createdQ = await prismaClient.question.create({
        data: {
          subjectId,
          questionText: q.qText,
          questionTextMr: q.qTextMr,
          explanation: q.expMr,
          explanationMr: q.expMr,
          difficulty: "MEDIUM",
          marks: 1,
          negativeMarks: meta.negativeMarks,
          status: "PUBLISHED",
          createdBy: bhavishAdmin.id,
          options: {
            create: q.options.map((opt, optIdx) => ({
              optionText: opt.text,
              optionTextMr: opt.text,
              isCorrect: opt.isCorrect,
              optionOrder: optIdx + 1,
            })),
          },
        },
      });

      await prismaClient.examQuestion.create({
        data: {
          examId: exam.id,
          questionId: createdQ.id,
          questionOrder: q.qNum,
          marks: 1,
          negativeMarks: meta.negativeMarks,
        },
      });
    }
  }

  await prismaClient.notification.create({
    data: {
      title: "🎯 महाराष्ट्र पोलीस भरती १० नवीन सराव पेपर्स उपलब्ध!",
      message: "महाराष्ट्र पोलीस भरती २०२५ साठी १०० प्रश्नांचे १० पूर्ण सराव संच आणि इतर सर्व परीक्षांचे पेपर्स लाइव्ह झाले आहेत. आताच सराव सुरू करा!",
      type: "FREE_EXAM",
      scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
      data: {
        url: "/student/exams",
        badge: "Police Bharti 10 Mocks",
      },
    },
  });

  return {
    success: true,
    totalExamsSeeded: examsMeta.length,
    totalQuestionsSeeded: examsMeta.length * 100,
    superAdminEmail: bhavishAdmin.email,
  };
}
