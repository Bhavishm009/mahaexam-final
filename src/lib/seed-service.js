import bcrypt from "bcryptjs";

// Helper function to shuffle array and randomize option order (1, 2, 3, 4)
function shuffleOptions(correctOpt, wrongOpts) {
  const all = [
    { ...correctOpt, isCorrect: true },
    ...wrongOpts.map((w) => ({ ...w, isCorrect: false })),
  ];
  // Deterministic or pseudo-random shuffle based on question parameters
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  return all;
}

// Comprehensive Syllabus Question Bank Generators covering all required Maharashtra exam topics
export function generate100Questions(examType, examIndex) {
  const questions = [];

  // 1. History of Maharashtra & India (इतिहास)
  const historyTemplates = [
    (i) => {
      const items = [
        {
          q: "Who was the founder of Satavahana dynasty in Maharashtra?",
          qMr: "महाराष्ट्रात सातवाहन घराण्याची स्थापना कोणी केली?",
          corr: "Simuka (सिमुक)",
          wrongs: ["Gautamiputra Satakarni (गौतमीपुत्र सातकर्णी)", "Hala (हाल)", "Pulamavi (पुलुमावी)"],
          expMr: "सातवाहन घराण्याचा संस्थापक सिमुक हा होता. प्रतिष्ठान (पैठण) ही त्यांची राजधानी होती.",
        },
        {
          q: "Who presided over the first session of Indian National Congress in Mumbai (1885)?",
          qMr: "१८८५ मध्ये मुंबईत झालेल्या राष्ट्रीय काँग्रेसच्या पहिल्या अधिवेशनाचे अध्यक्ष कोण होते?",
          corr: "W. C. Bonnerjee (व्योमेशचंद्र बॅनर्जी)",
          wrongs: ["Dadabhai Naoroji (दादाभाई नौरोजी)", "A. O. Hume (ॲलन ह्यूम)", "Gopal Krishna Gokhale (गोपाळ कृष्ण गोखले)"],
          expMr: "२८ डिसेंबर १८८५ रोजी मुंबईच्या गोकुळदास तेजपाल संस्कृत कॉलेजमध्ये पहिले अधिवेशन भरले, त्याचे अध्यक्ष व्योमेशचंद्र बॅनर्जी होते.",
        },
        {
          q: "Which social reformer established 'Satyashodhak Samaj' in 1873?",
          qMr: "१८७३ मध्ये 'सत्यशोधक समाजाची' स्थापना कोणत्या समाजसुधारकांनी केली?",
          corr: "Mahatma Jyotirao Phule (महात्मा ज्योतिराव फुले)",
          wrongs: ["Dr. B. R. Ambedkar (डॉ. बाबासाहेब आंबेडकर)", "Rajarshi Chhatrapati Shahu Maharaj (राजारर्षी शाहू महाराज)", "Maharshi Vitthal Ramji Shinde (महर्षी विठ्ठल रामजी शिंदे)"],
          expMr: "२४ सप्टेंबर १८७३ रोजी महात्मा ज्योतिराव फुले यांनी पुण्यात सत्यशोधक समाजाची स्थापना केली.",
        },
        {
          q: "In which year was Chhatrapati Shivaji Maharaj coronated at Fort Raigad?",
          qMr: "छत्रपती शिवाजी महाराजांचा राज्याभिषेक रायगडावर कोणत्या वर्षी झाला?",
          corr: "1674 AD (इ.स. १६७४)",
          wrongs: ["1680 AD (इ.स. १६८०)", "1665 AD (इ.स. १६६५)", "1657 AD (इ.स. १६५७)"],
          expMr: "६ जून १६७४ रोजी गागाभट्टांच्या उपस्थितीत रायगडावर छत्रपती शिवाजी महाराजांचा शिवराज्याभिषेक सोहळा संपन्न झाला.",
        },
        {
          q: "Who led the 1857 Revolt in Nashik and Peint region of Maharashtra?",
          qMr: "महाराष्ट्रात नाशिक-पेठ भागात १८५७ च्या उठावाचे नेतृत्व कोणी केले?",
          corr: "Bhagoji Naik & Kajar Singh (भागोजी नाईक)",
          wrongs: ["Rango Bapuji Gupte (रंगो बापूजी गुप्ते)", "Chimasaheb (चिमासाहेब)", "Tatya Tope (तात्या टोपे)"],
          expMr: "नाशिक, नगर व खान्देश परिसरात भिल्ल समाजाचे नेते भागोजी नाईक यांनी इंग्रजांविरुद्ध तीव्र लढा दिला.",
        },
        {
          q: "Who started the newspapers 'Kesari' and 'Mahratta' in 1881?",
          qMr: "१८८१ मध्ये 'केसरी' व 'मराठा' ही वृत्तपत्रे कोणी सुरू केली?",
          corr: "Lokmanya Tilak & Gopal Ganesh Agarkar (लोकमान्य टिळक व गोपाळ गणेश आगरकर)",
          wrongs: ["Vishnushastri Chiplunkar (विष्णूशास्त्री चिपळूणकर)", "Mahadev Govind Ranade (न्या. रानडे)", "Balshastri Jambhekar (बाळशास्त्री जांभेकर)"],
          expMr: "केसरी (मराठी) चे पहिले संपादक आगरकर होते आणि मराठा (इंग्रजी) चे संपादक लोकमान्य टिळक होते.",
        },
        {
          q: "Who was the first martyr of the Sanyukta Maharashtra Movement?",
          qMr: "संयुक्त महाराष्ट्र चळवळीतील पहिले हुतात्मा कोण मानले जातात?",
          corr: "Baburao Thorat / Shankar Karande (संयुक्त महाराष्ट्राचे हुतात्मे)",
          wrongs: ["S. M. Joshi (एस. एम. जोशी)", "Acharya Atre (आचार्य अत्रे)", "Senapati Bapat (सेनापती बापट)"],
          expMr: "संयुक्त महाराष्ट्र चळवळीत एकूण १०६ हुतात्म्यांनी बलिदान दिले. १ मे १९६० रोजी स्वतंत्र महाराष्ट्र राज्य अस्तित्वात आले.",
        },
        {
          q: "Who established 'Bahishkrit Hitakarini Sabha' in 1924 for social upliftment?",
          qMr: "१९२४ मध्ये 'बहिष्कृत हितकारिणी सभे'ची स्थापना कोणी केली?",
          corr: "Dr. B. R. Ambedkar (डॉ. बाबासाहेब आंबेडकर)",
          wrongs: ["Mahatma Phule (महात्मा फुले)", "Chhatrapati Shahu Maharaj (शाहू महाराज)", "Maharshi Karve (महर्षी कर्वे)"],
          expMr: "'शिका, संघटित व्हा आणि संघर्ष करा' हे ब्रीदवाक्य असलेल्या बहिष्कृत हितकारिणी सभेची स्थापना डॉ. बाबासाहेब आंबेडकरांनी केली.",
        },
      ];
      const item = items[i % items.length];
      return {
        subject: "history",
        qText: item.q,
        qTextMr: item.qMr,
        options: shuffleOptions(
          { text: item.corr },
          item.wrongs.map((w) => ({ text: w })),
        ),
        expMr: item.expMr,
      };
    },
  ];

  // 2. Geography of Maharashtra & India (भूगोल)
  const geographyTemplates = [
    (i) => {
      const items = [
        {
          q: "Which is the highest peak in Maharashtra?",
          qMr: "महाराष्ट्रातील सर्वोच्च पर्वतशिखर कोणते आहे?",
          corr: "Kalsubai - 1646m (कळसूबाई - १६४६ मी.)",
          wrongs: ["Salher (साल्हेर)", "Mahabaleshwar (महाबळेश्वर)", "Harishchandragad (हरिश्चंद्रगड)"],
          expMr: "कळसूबाई शिखर हे अहमदनगर जिल्ह्यातील अकोले तालुक्यात असून त्याची उंची १६४६ मीटर आहे.",
        },
        {
          q: "On which river is the Jayakwadi Dam (Nath Sagar) located?",
          qMr: "जायकवाडी धरण (नाथसागर जलाशय) कोणत्या नदीवर बांधण्यात आले आहे?",
          corr: "Godavari (गोदावरी)",
          wrongs: ["Krishna (कृष्णा)", "Bhima (भीमा)", "Tapi (तापी)"],
          expMr: "जायकवाडी धरण हे छत्रपती संभाजीनगर जिल्ह्यातील पैठण येथे गोदावरी नदीवर आहे.",
        },
        {
          q: "Which soil in Maharashtra is best suited for cotton cultivation?",
          qMr: "महाराष्ट्रात कापूस पिकासाठी कोणती काळी मृदा सर्वाधिक उपयुक्त मानली जाते?",
          corr: "Regur / Black Soil (रेगूर / काळी कापसाची मृदा)",
          wrongs: ["Laterite Soil (जांभी मृदा)", "Alluvial Soil (गाळाची मृदा)", "Red Sandy Soil (तांबडी मृदा)"],
          expMr: "बेसाल्ट खडकाच्या विदारणातून तयार झालेली रेगूर (काळी) मृदा ओलावा टिकवून ठेवते व कापूस उत्पादनासाठी उत्तम असते.",
        },
        {
          q: "In which district is Tadoba-Andhari National Park located?",
          qMr: "ताडोबा-अंधारी राष्ट्रीय व्याघ्र प्रकल्प कोणत्या जिल्ह्यात आहे?",
          corr: "Chandrapur (चंद्रपूर)",
          wrongs: ["Nagpur (नागपूर)", "Amravati (अमरावती)", "Gadchiroli (गडचिरोली)"],
          expMr: "ताडोबा हे महाराष्ट्रातील पहिले व प्रमुख राष्ट्रीय उद्यान चंद्रपूर जिल्ह्यात आहे.",
        },
        {
          q: "Which is the largest river system in Maharashtra by basin area?",
          qMr: "महाराष्ट्राचे सर्वाधिक क्षेत्र (सुमारे ४९%) कोणत्या नदीच्या खोऱ्याने व्यापले आहे?",
          corr: "Godavari Basin (गोदावरी खोरे)",
          wrongs: ["Krishna Basin (कृष्णा खोरे)", "Bhima Basin (भीमा खोरे)", "Tapi Basin (तापी खोरे)"],
          expMr: "गोदावरी नदी त्र्यंबकेश्वर (नाशिक) येथे उगम पावते आणि तिला 'दक्षिण भारताची गंगा' म्हणतात.",
        },
        {
          q: "Which pass (Ghat) connects Mumbai to Pune through the Sahyadri range?",
          qMr: "मुंबई आणि पुणे यांना जोडणारा सह्याद्रीतील प्रसिद्ध घाट कोणता?",
          corr: "Bhor Ghat / Khandala Ghat (बोरघाट / खंडाळा घाट)",
          wrongs: ["Thal Ghat / Kasara (थळघाट)", "Varandha Ghat (वरंधा घाट)", "Amboli Ghat (आंबोली घाट)"],
          expMr: "मुंबई-पुणे राष्ट्रीय महामार्ग बोरघाटातून जातो, तर मुंबई-नाशिक महामार्ग थळघाटातून जातो.",
        },
        {
          q: "Lonar crater lake in Buldhana was created by which phenomenon?",
          qMr: "बुलढाणा जिल्ह्यातील प्रसिद्ध लोणार सरोवर कशामुळे तयार झाले आहे?",
          corr: "Meteorite Impact (उल्कापातामुळे)",
          wrongs: ["Volcanic Eruption (ज्वालामुखी उद्रेक)", "Earthquake (भूकंप)", "Glacial Erosion (हिमनदी कार्य)"],
          expMr: "लोणार सरोवर हे उल्कापातामुळे तयार झालेले खऱ्या पाण्याचे बेसाल्टिक सरोवर असून जागतिक वारसा स्थळ आहे.",
        },
      ];
      const item = items[i % items.length];
      return {
        subject: "geography",
        qText: item.q,
        qTextMr: item.qMr,
        options: shuffleOptions(
          { text: item.corr },
          item.wrongs.map((w) => ({ text: w })),
        ),
        expMr: item.expMr,
      };
    },
  ];

  // 3. Constitution & Indian Polity (राज्यघटना व नागरिकशास्त्र)
  const constitutionTemplates = [
    (i) => {
      const items = [
        {
          q: "Who was the Chairman of the Drafting Committee of the Indian Constitution?",
          qMr: "भारतीय राज्यघटनेच्या मसुदा समितीचे अध्यक्ष कोण होते?",
          corr: "Dr. B. R. Ambedkar (डॉ. बाबासाहेब आंबेडकर)",
          wrongs: ["Dr. Rajendra Prasad (डॉ. राजेंद्र प्रसाद)", "Pandit Jawaharlal Nehru (पं. जवाहरलाल नेहरू)", "B. N. Rau (बी. एन. राव)"],
          expMr: "२९ ऑगस्ट १९४७ रोजी स्थापन झालेल्या मसुदा समितीचे अध्यक्ष भारतरत्न डॉ. बाबासाहेब आंबेडकर होते.",
        },
        {
          q: "Under which Article of the Constitution are Fundamental Rights guaranteed?",
          qMr: "भारतीय राज्यघटनेच्या कोणत्या कलमान्वये नागरिकांना मूलभूत हक्क प्रदान करण्यात आले आहेत?",
          corr: "Articles 12 to 35 (कलम १२ ते ३५ - भाग ३)",
          wrongs: ["Articles 36 to 51 (कलम ३६ ते ५१)", "Articles 51A (कलम ५१ अ)", "Articles 1 to 4 (कलम १ ते ४)"],
          expMr: "राज्यघटनेच्या भाग ३ मधील कलम १२ ते ३५ दरम्यान ६ मूलभूत हक्क देण्यात आले आहेत.",
        },
        {
          q: "Which constitutional amendment added the words 'Socialist, Secular and Integrity' to the Preamble?",
          qMr: "कोणत्या घटनादुरुस्तीने राज्यघटनेच्या उद्देशपत्रिकेत 'समाजवादी, धर्मनिरपेक्ष व अखंडता' हे शब्द जोडले गेले?",
          corr: "42nd Constitutional Amendment 1976 (४२ वी घटनादुरुस्ती १९७६)",
          wrongs: ["44th Amendment 1978 (४४ वी घटनादुरुस्ती)", "73rd Amendment 1992 (७३ वी घटनादुरुस्ती)", "86th Amendment 2002 (८६ वी घटनादुरुस्ती)"],
          expMr: "१९७६ च्या ४२ व्या घटनादुरुस्तीला 'लघु राज्यघटना' (Mini Constitution) असेही म्हटले जाते.",
        },
        {
          q: "Under which Article can the Supreme Court issue Writs for enforcement of Fundamental Rights?",
          qMr: "मूलभूत हक्कांच्या संरक्षणासाठी सर्वोच्च न्यायालय कोणत्या कलमान्वये आदेश/रिट्स (Writs) जारी करते?",
          corr: "Article 32 (कलम ३२ - घटनात्मक उपायांचा हक्क)",
          wrongs: ["Article 226 (कलम २२६)", "Article 14 (कलम १४)", "Article 21 (कलम २१)"],
          expMr: "डॉ. आंबेडकरांनी कलम ३२ ला 'घटनेचा आत्मा आणि हृदय' म्हटले आहे. उच्च न्यायालयाला कलम २२६ अन्वये अधिकार आहेत.",
        },
        {
          q: "Which Constitutional Amendment gave constitutional status to Panchayati Raj institutions in India?",
          qMr: "भारतात पंचायत राज व्यवस्थेला घटनात्मक दर्जा कोणत्या घटनादुरुस्तीने मिळाला?",
          corr: "73rd Constitutional Amendment 1992 (७३ वी घटनादुरुस्ती १९९२)",
          wrongs: ["74th Amendment (७४ वी घटनादुरुस्ती)", "52nd Amendment (५२ वी घटनादुरुस्ती)", "61st Amendment (६१ वी घटनादुरुस्ती)"],
          expMr: "७३ व्या घटनादुरुस्तीने संविधानात भाग ९ व ११ वी अनुसूची समाविष्ट केली.",
        },
        {
          q: "What is the minimum age required to become the President of India?",
          qMr: "भारताचे राष्ट्रपती होण्यासाठी किमान वयोमर्यादा किती वर्षे असावी लागते?",
          corr: "35 Years (३५ वर्षे)",
          wrongs: ["30 Years (३० वर्षे)", "25 Years (२५ वर्षे)", "21 Years (२१ वर्षे)"],
          expMr: "कलम ५८ नुसार राष्ट्रपती व उपराष्ट्रपती पदासाठी किमान ३५ वर्षे वय पूर्ण असणे आवश्यक आहे.",
        },
        {
          q: "Who is the ex-officio Chairman of the Rajya Sabha in India?",
          qMr: "भारताच्या राज्यसभेचे पदसिद्ध सभापती कोण असतात?",
          corr: "Vice-President of India (भारताचे उपराष्ट्रपती)",
          wrongs: ["Speaker of Lok Sabha (लोकसभा अध्यक्ष)", "Prime Minister (पंतप्रधान)", "Chief Justice of India (सरन्यायाधीश)"],
          expMr: "कलम ६४ नुसार भारताचे उपराष्ट्रपती हे राज्यसभेचे पदसिद्ध अध्यक्ष/सभापती असतात.",
        },
      ];
      const item = items[i % items.length];
      return {
        subject: "constitution",
        qText: item.q,
        qTextMr: item.qMr,
        options: shuffleOptions(
          { text: item.corr },
          item.wrongs.map((w) => ({ text: w })),
        ),
        expMr: item.expMr,
      };
    },
  ];

  // 4. Marathi Grammar (मराठी व्याकरण)
  const marathiTemplates = [
    (i) => {
      const items = [
        {
          q: "Identify the correct compound type (Samas) for the word 'प्रतिदिन (Pratidin)'.",
          qMr: "'प्रतिदिन' या शब्दाचा समास ओळखा.",
          corr: "Avyayibhav Samas (अव्ययीभाव समास)",
          wrongs: ["Tatpurusha Samas (तत्पुरुष समास)", "Dvandva Samas (द्वंद्व समास)", "Bahuvrihi Samas (बहुव्रीही समास)"],
          expMr: "ज्या सामासिक शब्दातील पहिले पद मुख्य असते व तो शब्द क्रियाविशेषणासारखा कार्य करतो त्यास अव्ययीभाव समास म्हणतात.",
        },
        {
          q: "Identify the experiment (Prayog) type: 'रामाने रावणास मारले.'",
          qMr: "'रामाने रावणास मारले.' या वाक्यातील प्रयोग ओळखा.",
          corr: "Bhave Prayog (भावे प्रयोग)",
          wrongs: ["Kartari Prayog (कर्तरी प्रयोग)", "Karmani Prayog (कर्मणी प्रयोग)", "Mishra Prayog (मिश्र प्रयोग)"],
          expMr: "कर्ता व कर्म दोघांनाही प्रत्यय असल्यामुळे क्रियापद दोघांनुसार बदलत नाही, म्हणून हा भावे प्रयोग आहे.",
        },
        {
          q: "Choose the correct Sandhi for: 'सत् + जन'",
          qMr: "'सत् + जन' या शब्दाची योग्य संधी कोणती होईल?",
          corr: "सज्जन (Sajjan)",
          wrongs: ["सतजन (Satjan)", "सजन (Sajan)", "सदजन (Sadjan)"],
          expMr: "व्यंजन संधीच्या नियमानुसार 'त्' पुढे 'ज्' आल्यास 'त्' चा 'ज्' होतो, म्हणून सत् + जन = सज्जन.",
        },
        {
          q: "What is the meaning of the Marathi proverb 'काखेत कळसा गावाला वळसा'?",
          qMr: "'काखेत कळसा गावाला वळसा' या म्हणीचा योग्य अर्थ सांगा.",
          corr: "जवळ असलेली वस्तू दूर शोधत फिरणे",
          wrongs: ["अति हुशारीमुळे नुकसान होणे", "अंगी कमी गुण असून बडबड करणे", "वेळ संपल्यावर काम सुरू करणे"],
          expMr: "स्वतःजवळच उपलब्ध असणारी वस्तू सर्वत्र शोधणे म्हणजे काखेत कळसा गावाला वळसा.",
        },
        {
          q: "Which of the following is a Mahaprana consonant in Marathi?",
          qMr: "खालीलपैकी कोणता वर्ण 'महाप्राण' वर्ण म्हणून ओळखला जातो?",
          corr: "'ह' (Ha)",
          wrongs: ["'क' (Ka)", "'म' (Ma)", "'य' (Ya)"],
          expMr: "मराठीत 'ह' हा मुख्य महाप्राण वर्ण आहे, तसेच ज्या वर्णात 'h' चा उच्चार मिसळलेला असतो ते महाप्राण वर्ण असतात.",
        },
        {
          q: "Select the correct synonym for the word 'अवनि (Avani)'.",
          qMr: "'अवनि' या शब्दाचा अचूक समानार्थी शब्द कोणता?",
          corr: "पृथ्वी / धरणी (Prithvi / Dharni)",
          wrongs: ["आकाश (Aakash)", "समुद्र (Samudra)", "वारा (Vara)"],
          expMr: "अवनि, धरणी, वसुंधरा, क्षिती, मही हे सर्व पृथ्वी या शब्दाचे समानार्थी शब्द आहेत.",
        },
      ];
      const item = items[i % items.length];
      return {
        subject: "marathi",
        qText: item.q,
        qTextMr: item.qMr,
        options: shuffleOptions(
          { text: item.corr },
          item.wrongs.map((w) => ({ text: w })),
        ),
        expMr: item.expMr,
      };
    },
  ];

  // 5. English Language & Grammar
  const englishTemplates = [
    (i) => {
      const items = [
        {
          q: "Select the correct One Word Substitute: 'A life history of a person written by himself.'",
          qMr: "'A life history of a person written by himself.' या शब्दसमूहासाठी योग्य शब्द निवडा.",
          corr: "Autobiography",
          wrongs: ["Biography", "Calligraphy", "Bibliophile"],
          expMr: "स्वतःचे चरित्र स्वतः लिहिणे म्हणजे Autobiography (आत्मचरित्र).",
        },
        {
          q: "Choose the correct Antonym for the word: 'TRANSPARENT'",
          qMr: "'TRANSPARENT' या शब्दाचा योग्य विरुद्धार्थी (Antonym) शब्द निवडा.",
          corr: "Opaque",
          wrongs: ["Clear", "Lucid", "Bright"],
          expMr: "Transparent म्हणजे पारदर्शक, तर Opaque म्हणजे अपारदर्शक.",
        },
        {
          q: "Fill in the blank with appropriate preposition: 'He is proficient _____ Mathematics.'",
          qMr: "योग्य Preposition निवडा: 'He is proficient _____ Mathematics.'",
          corr: "in",
          wrongs: ["at", "with", "on"],
          expMr: "Proficient या विशेषणानंतर 'in' हे preposition वापरले जाते.",
        },
        {
          q: "Select the correct Passive Voice for: 'The police caught the thief.'",
          qMr: "'The police caught the thief.' या वाक्याचे Passive Voice मध्ये रूपांतर ओळखा.",
          corr: "The thief was caught by the police.",
          wrongs: ["The thief is caught by the police.", "The thief had been caught by the police.", "The thief was being caught by the police."],
          expMr: "Simple Past Tense चा Passive form: Object + was/were + V3 + by + Subject होतो.",
        },
        {
          q: "What is the meaning of the idiom: 'To spill the beans'?",
          qMr: "'To spill the beans' या इंग्रजी वाक्प्रचाराचा अर्थ काय आहे?",
          corr: "To reveal a secret prematurely",
          wrongs: ["To drop food on the floor", "To work very hard", "To cancel a plan"],
          expMr: "To spill the beans म्हणजे गुप्त गोष्ट किंवा रहस्य उघड करणे.",
        },
      ];
      const item = items[i % items.length];
      return {
        subject: "english",
        qText: item.q,
        qTextMr: item.qMr,
        options: shuffleOptions(
          { text: item.corr },
          item.wrongs.map((w) => ({ text: w })),
        ),
        expMr: item.expMr,
      };
    },
  ];

  // 6. Quantitative Aptitude / Mathematics (अंकगणित)
  const mathsTemplates = [
    (i) => {
      const p = 2000 + (i % 15) * 500;
      const r = 8;
      const t = 3;
      const si = (p * r * t) / 100;
      return {
        subject: "mathematics",
        qText: `Find the Simple Interest on ₹${p} at the rate of ${r}% per annum for ${t} years.`,
        qTextMr: `₹${p} रकमेवर दरसाल दरशेकडा ${r} दराने ${t} वर्षांचे सरळव्याज किती होईल?`,
        options: shuffleOptions(
          { text: `₹${si}` },
          [{ text: `₹${si + 60}` }, { text: `₹${si - 40}` }, { text: `₹${si + 120}` }],
        ),
        expMr: `सरळव्याज = (मुद्दल × दर × काळ) / १०० = (${p} × ${r} × ${t}) / १०० = ₹${si}.`,
      };
    },
    (i) => {
      const cp = 500 + (i % 10) * 50;
      const profit = 20;
      const sp = cp + (cp * profit) / 100;
      return {
        subject: "mathematics",
        qText: `A product bought for ₹${cp} is sold at a profit of ${profit}%. What is its Selling Price?`,
        qTextMr: `एका वस्तूची खरेदी किंमत ₹${cp} असून ती ${profit}% नफ्याने विकल्यास तिची विक्री किंमत किती होईल?`,
        options: shuffleOptions(
          { text: `₹${sp}` },
          [{ text: `₹${sp + 25}` }, { text: `₹${sp - 30}` }, { text: `₹${sp + 50}` }],
        ),
        expMr: `विक्री किंमत = खरेदी किंमत + नफा = ${cp} + (${cp} × ${profit} / १००) = ₹${sp}.`,
      };
    },
    (i) => {
      const speedKm = 72 + (i % 5) * 18;
      const speedMs = (speedKm * 5) / 18;
      return {
        subject: "mathematics",
        qText: `Convert a speed of ${speedKm} km/h into meters per second (m/s).`,
        qTextMr: `${speedKm} किमी/तास वेगाचे मीटर/सेकंद (m/s) मध्ये रूपांतर किती होईल?`,
        options: shuffleOptions(
          { text: `${speedMs} m/s` },
          [{ text: `${speedMs + 5} m/s` }, { text: `${speedMs - 3} m/s` }, { text: `${speedMs + 10} m/s` }],
        ),
        expMr: `किमी/तास ते मी/से करण्यासाठी ५/१८ ने गुणावे: ${speedKm} × (५/१८) = ${speedMs} m/s.`,
      };
    },
  ];

  // 7. Logical Reasoning (बुद्धिमत्ता चाचणी)
  const reasoningTemplates = [
    (i) => {
      const start = 3 + (i % 8);
      const diff = 4 + (i % 4);
      const seq = [start, start + diff, start + 2 * diff, start + 3 * diff, start + 4 * diff];
      const next = start + 5 * diff;
      return {
        subject: "reasoning",
        qText: `Find the next number in the arithmetic series: ${seq.join(", ")}, ?`,
        qTextMr: `संख्या मालिकेतील पुढील पद ओळखा: ${seq.join(", ")}, ?`,
        options: shuffleOptions(
          { text: `${next}` },
          [{ text: `${next + 2}` }, { text: `${next - diff}` }, { text: `${next + 5}` }],
        ),
        expMr: `मालिकेतील प्रत्येक पदात +${diff} ची वाढ होत आहे. म्हणून पुढील पद ${next} येईल.`,
      };
    },
    (i) => {
      const items = [
        {
          q: "In a code language, if 'CAT' is coded as '3120', how is 'DOG' coded?",
          qMr: "एका सांकेतिक भाषेत 'CAT' ला '3120' लिहिले जाते, तर 'DOG' ला कसे लिहिले जाईल?",
          corr: "4157 (D=4, O=15, G=7)",
          wrongs: ["4158", "3147", "4167"],
          expMr: "प्रत्येक अक्षराचा इंग्रजी वर्णमालेतील अनुक्रमांक लिहिला आहे: D(4), O(15), G(7) = 4157.",
        },
        {
          q: "Pointing to a man, Rahul said, 'He is the only son of my father's father.' How is the man related to Rahul?",
          qMr: "एका पुरुषाकडे बोट दाखवत राहुल म्हणाला, 'हा माझ्या वडिलांच्या वडिलांचा एकुलता एक मुलगा आहे.' तर तो पुरुष राहुलचा कोण लागतो?",
          corr: "Father (वडील)",
          wrongs: ["Brother (भाऊ)", "Uncle (काका)", "Grandfather (आजोबा)"],
          expMr: "वडिलांचे वडील म्हणजे आजोबा; आजोबांचा एकुलता एक मुलगा म्हणजे स्वतः राहुलचे वडील.",
        },
      ];
      const item = items[i % items.length];
      return {
        subject: "reasoning",
        qText: item.q,
        qTextMr: item.qMr,
        options: shuffleOptions(
          { text: item.corr },
          item.wrongs.map((w) => ({ text: w })),
        ),
        expMr: item.expMr,
      };
    },
  ];

  // 8. General Science (सामान्य विज्ञान)
  const scienceTemplates = [
    (i) => {
      const items = [
        {
          q: "Deficiency of which Vitamin causes Night Blindness (रातांधळेपणा)?",
          qMr: "कोणत्या जीवनसत्त्वाच्या अभावामुळे 'रातांधळेपणा' हा रोग होतो?",
          corr: "Vitamin A (जीवनसत्त्व अ)",
          wrongs: ["Vitamin C (जीवनसत्त्व क)", "Vitamin D (जीवनसत्त्व ड)", "Vitamin B12 (जीवनसत्त्व ब१२)"],
          expMr: "जीवनसत्त्व 'अ' च्या (Retinol) अभावामुळे डोळ्यांचे विकार व रातांधळेपणा होतो.",
        },
        {
          q: "What is the powerhouse of the human cell?",
          qMr: "सजीवांच्या पेशीचे 'ऊर्जा केंद्र' (Powerhouse of the cell) कोणास म्हणतात?",
          corr: "Mitochondria (तंतुकणिका)",
          wrongs: ["Ribosome (रायबोसोम)", "Lysosome (लयकारिका)", "Nucleus (केंद्रक)"],
          expMr: "तंतुकणिकांमध्ये पेशीय श्वसनातून ATP स्वरूपात ऊर्जा निर्माण होते, म्हणून त्यास ऊर्जा केंद्र म्हणतात.",
        },
        {
          q: "What is the chemical formula of Washing Soda?",
          qMr: "धुण्याच्या सोड्याचे रासायनिक सूत्र कोणते आहे?",
          corr: "Na2CO3.10H2O (सोडियम कार्बोनेट)",
          wrongs: ["NaHCO3 (सोडियम बायकार्बोनेट)", "NaCl (सोडियम क्लोराईड)", "NaOH (सोडियम हायड्रॉक्साईड)"],
          expMr: "धुण्याचा सोडा = सोडियम कार्बोनेट (Na2CO3), तर खाण्याचा सोडा = सोडियम बायकार्बोनेट (NaHCO3).",
        },
        {
          q: "What is the SI unit of Electric Current?",
          qMr: "विद्युतधारेचे एस. आय. (SI) एकक कोणते आहे?",
          corr: "Ampere (अँपिअर)",
          wrongs: ["Volt (व्होल्ट)", "Ohm (ओहम)", "Watt (वॅट)"],
          expMr: "विद्युतधारेचे एकक अँपिअर (A), विभवांतराचे व्होल्ट (V) आणि रोधाचे ओहम (Ω) आहे.",
        },
      ];
      const item = items[i % items.length];
      return {
        subject: "science",
        qText: item.q,
        qTextMr: item.qMr,
        options: shuffleOptions(
          { text: item.corr },
          item.wrongs.map((w) => ({ text: w })),
        ),
        expMr: item.expMr,
      };
    },
  ];

  // Distribute 100 questions per exam blueprint:
  for (let qNum = 1; qNum <= 100; qNum++) {
    const seedOffset = examIndex * 100 + qNum;
    let generator = null;

    if (qNum <= 20) {
      generator = marathiTemplates[qNum % marathiTemplates.length];
    } else if (qNum <= 40) {
      if (examType.includes("POLICE")) {
        generator = mathsTemplates[qNum % mathsTemplates.length];
      } else {
        generator = englishTemplates[qNum % englishTemplates.length];
      }
    } else if (qNum <= 60) {
      generator = reasoningTemplates[qNum % reasoningTemplates.length];
    } else if (qNum <= 75) {
      generator = constitutionTemplates[qNum % constitutionTemplates.length];
    } else if (qNum <= 88) {
      generator = historyTemplates[qNum % historyTemplates.length];
    } else {
      generator = geographyTemplates[qNum % geographyTemplates.length];
    }

    const qData = generator(seedOffset);

    questions.push({
      qNum,
      subject: qData.subject,
      qText: `[Q${qNum}] ${qData.qText}`,
      qTextMr: `[प्रश्न ${qNum}] ${qData.qTextMr}`,
      options: qData.options,
      expMr: qData.expMr,
    });
  }

  return questions;
}

export async function runCompleteDatabaseSeed(prismaClient) {
  console.warn("🌱 Starting Enterprise Production Database Seeding with 10 Topics & Randomized Answer Keys...");

  // 1. Academy Organization
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

  // 2. Super Admin User
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

  // Fallback Admin
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

  // 3. Demo Users
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

  // 4. Setup All Subjects in Maharashtra Syllabus
  const subjectsData = [
    { name: "History of Maharashtra & India", nameMr: "इतिहास (महाराष्ट्राचा व भारताचा इतिहास)", slug: "history" },
    { name: "Geography of Maharashtra & India", nameMr: "भूगोल (महाराष्ट्राचा व भारताचा भूगोल)", slug: "geography" },
    { name: "Indian Polity & Constitution", nameMr: "भारतीय राज्यघटना व नागरिकशास्त्र", slug: "constitution" },
    { name: "Marathi Grammar", nameMr: "मराठी व्याकरण व शब्दसंग्रह", slug: "marathi" },
    { name: "English Language & Grammar", nameMr: "इंग्रजी व्याकरण (English Language)", slug: "english" },
    { name: "Mathematics & Quantitative Aptitude", nameMr: "अंकगणित व संख्यात्मक अभियोग्यता", slug: "mathematics" },
    { name: "Logical Reasoning & Mental Ability", nameMr: "बुद्धिमत्ता चाचणी व तर्कक्षमता", slug: "reasoning" },
    { name: "General Science", nameMr: "सामान्य विज्ञान (भौतिक, रसायन व जीवशास्त्र)", slug: "science" },
    { name: "Economics & Budget", nameMr: "अर्थव्यवस्था व शासकीय योजना", slug: "economics" },
    { name: "Current Affairs & Static GK", nameMr: "चालू घडामोडी व सामान्य ज्ञान", slug: "general-knowledge" },
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

  // 5. Build 27 Exams Blueprint: EXACTLY 10 LIVE EXAMS + 17 DRAFT EXAMS
  const examsMeta = [
    // --- 10 LIVE EXAMS (Exams 1 to 10) ---
    {
      title: "Maharashtra Police Bharti 2025 Grand Mega Mock 01 (महाराष्ट्र पोलीस शिपाई सराव परीक्षा - ०१)",
      slug: "police-bharti-mock-01",
      examType: "POLICE_BHARTI",
      durationMinutes: 90,
      passingMarks: 40,
      negativeMarks: 0,
      status: "LIVE",
      description: "महाराष्ट्र पोलीस शिपाई व चालक भरती २०२५ सराव संच क्रमांक ०१ - १०० गुणांची मोफत ऑनलाइन लाइव्ह टेस्ट.",
    },
    {
      title: "Maharashtra Police Bharti 2025 Grand Mega Mock 02 (महाराष्ट्र पोलीस शिपाई सराव परीक्षा - ०२)",
      slug: "police-bharti-mock-02",
      examType: "POLICE_BHARTI",
      durationMinutes: 90,
      passingMarks: 40,
      negativeMarks: 0,
      status: "LIVE",
      description: "महाराष्ट्र पोलीस शिपाई व चालक भरती २०२५ सराव संच क्रमांक ०२ - १०० गुणांची मोफत ऑनलाइन लाइव्ह टेस्ट.",
    },
    {
      title: "Maharashtra Police Bharti 2025 Grand Mega Mock 03 (महाराष्ट्र पोलीस शिपाई सराव परीक्षा - ०३)",
      slug: "police-bharti-mock-03",
      examType: "POLICE_BHARTI",
      durationMinutes: 90,
      passingMarks: 40,
      negativeMarks: 0,
      status: "LIVE",
      description: "महाराष्ट्र पोलीस शिपाई व चालक भरती २०२५ सराव संच क्रमांक ०३ - १०० गुणांची मोफत ऑनलाइन लाइव्ह टेस्ट.",
    },
    {
      title: "Maharashtra Police Bharti 2025 Grand Mega Mock 04 (महाराष्ट्र पोलीस शिपाई सराव परीक्षा - ०४)",
      slug: "police-bharti-mock-04",
      examType: "POLICE_BHARTI",
      durationMinutes: 90,
      passingMarks: 40,
      negativeMarks: 0,
      status: "LIVE",
      description: "महाराष्ट्र पोलीस शिपाई व चालक भरती २०२५ सराव संच क्रमांक ०४ - १०० गुणांची मोफत ऑनलाइन लाइव्ह टेस्ट.",
    },
    {
      title: "MPSC Rajyaseva GS Paper 1 Prelims Grand Mock 01 (राज्यसेवा पूर्व परीक्षा सामान्य अध्ययन - ०१)",
      slug: "mpsc-rajyaseva-mock-01",
      examType: "MPSC_RAJYASEVA",
      durationMinutes: 120,
      passingMarks: 50,
      negativeMarks: 0.25,
      status: "LIVE",
      description: "एमपीएससी राज्यसेवा पूर्व परीक्षा सामान्य अध्ययन १०० वस्तुनिष्ठ प्रश्न - संच ०१.",
    },
    {
      title: "MPSC Rajyaseva GS Paper 1 Prelims Grand Mock 02 (राज्यसेवा पूर्व परीक्षा सामान्य अध्ययन - ०२)",
      slug: "mpsc-rajyaseva-mock-02",
      examType: "MPSC_RAJYASEVA",
      durationMinutes: 120,
      passingMarks: 50,
      negativeMarks: 0.25,
      status: "LIVE",
      description: "एमपीएससी राज्यसेवा पूर्व परीक्षा सामान्य अध्ययन १०० वस्तुनिष्ठ प्रश्न - संच ०२.",
    },
    {
      title: "MPSC Group B & C (Combine) Prelims Grand Mock 01 (संयुक्त पूर्व परीक्षा गट ब व क - ०१)",
      slug: "mpsc-combine-mock-01",
      examType: "MPSC_COMBINE",
      durationMinutes: 60,
      passingMarks: 45,
      negativeMarks: 0.25,
      status: "LIVE",
      description: "एमपीएससी गट ब व गट क संयुक्त पूर्व परीक्षेसाठी १०० प्रश्नांची सराव टेस्ट ०१.",
    },
    {
      title: "Maharashtra Talathi Bharti Grand Mock Test 01 (तलाठी भरती सराव परीक्षा - ०१)",
      slug: "talathi-mock-01",
      examType: "TALATHI",
      durationMinutes: 120,
      passingMarks: 45,
      negativeMarks: 0,
      status: "LIVE",
      description: "TCS पॅटर्ननुसार तलाठी भरती १०० प्रश्नांचा संपूर्ण सराव पेपर ०१.",
    },
    {
      title: "Zilla Parishad (ZP) Arogya Sevak & Gramsevak Grand Test 01 (जिल्हा परिषद भरती विशेष - ०१)",
      slug: "zp-gramsevak-mock-01",
      examType: "ZILLA_PARISHAD",
      durationMinutes: 90,
      passingMarks: 40,
      negativeMarks: 0,
      status: "LIVE",
      description: "जिल्हा परिषद अंतर्गत आरोग्य सेवक व ग्रामसेवक १०० प्रश्नांचा सराव संच ०१.",
    },
    {
      title: "Maharashtra Vanrakshak (Forest Guard) Grand CBT Mock 01 (वनरक्षक भरती सराव परीक्षा - ०१)",
      slug: "vanrakshak-mock-01",
      examType: "VANRAKSHAK",
      durationMinutes: 90,
      passingMarks: 45,
      negativeMarks: 0,
      status: "LIVE",
      description: "वनरक्षक भरती १०० प्रश्न - पर्यावरण, वने, जैवविविधता व भूगोल - संच ०१.",
    },

    // --- 17 DRAFT EXAMS (Available in Admin to Publish Anytime) ---
    ...Array.from({ length: 6 }, (_, i) => ({
      title: `Maharashtra Police Bharti 2025 Grand Mock Test ${String(i + 5).padStart(2, "0")} (पोलीस भरती संच - ${String(i + 5).padStart(2, "0")})`,
      slug: `police-bharti-mock-${String(i + 5).padStart(2, "0")}`,
      examType: "POLICE_BHARTI",
      durationMinutes: 90,
      passingMarks: 40,
      negativeMarks: 0,
      status: "DRAFT",
      description: `महाराष्ट्र पोलीस भरती १०० गुणांचा सराव संच ${i + 5} (मसुदा / Draft).`,
    })),
    ...Array.from({ length: 4 }, (_, i) => ({
      title: `Maharashtra Talathi Bharti Grand Mock Test ${String(i + 2).padStart(2, "0")} (तलाठी भरती संच - ${String(i + 2).padStart(2, "0")})`,
      slug: `talathi-mock-${String(i + 2).padStart(2, "0")}`,
      examType: "TALATHI",
      durationMinutes: 120,
      passingMarks: 45,
      negativeMarks: 0,
      status: "DRAFT",
      description: `TCS पॅटर्न तलाठी भरती १०० प्रश्नांचा सराव संच ${i + 2} (Draft).`,
    })),
    {
      title: "MPSC Group B & C (Combine) Prelims Grand Mock 02 (संयुक्त पूर्व परीक्षा - ०२)",
      slug: "mpsc-combine-mock-02",
      examType: "MPSC_COMBINE",
      durationMinutes: 60,
      passingMarks: 45,
      negativeMarks: 0.25,
      status: "DRAFT",
      description: "एमपीएससी गट ब व गट क संयुक्त पूर्व परीक्षा १०० प्रश्न संच ०२ (Draft).",
    },
    {
      title: "Zilla Parishad (ZP) Arogya Sevak & Gramsevak Grand Test 02 (जिल्हा परिषद संच - ०२)",
      slug: "zp-gramsevak-mock-02",
      examType: "ZILLA_PARISHAD",
      durationMinutes: 90,
      passingMarks: 40,
      negativeMarks: 0,
      status: "DRAFT",
      description: "जिल्हा परिषद भरती १०० प्रश्न संच ०२ (Draft).",
    },
    {
      title: "Maharashtra Vanrakshak (Forest Guard) Grand CBT Mock 02 (वनरक्षक संच - ०२)",
      slug: "vanrakshak-mock-02",
      examType: "VANRAKSHAK",
      durationMinutes: 90,
      passingMarks: 45,
      negativeMarks: 0,
      status: "DRAFT",
      description: "वनरक्षक भरती १०० प्रश्न संच ०२ (Draft).",
    },
    {
      title: "Saralseva Marathi Grammar & GK 100-Question Master Test 01 (सरळसेवा विशेष - ०१)",
      slug: "saralseva-gk-marathi-01",
      examType: "SARALSEVA",
      durationMinutes: 90,
      passingMarks: 40,
      negativeMarks: 0,
      status: "DRAFT",
      description: "सरळसेवा भरती १०० गुणांचा मास्टर सराव पेपर ०१ (Draft).",
    },
    {
      title: "Saralseva Marathi Grammar & GK 100-Question Master Test 02 (सरळसेवा विशेष - ०२)",
      slug: "saralseva-gk-marathi-02",
      examType: "SARALSEVA",
      durationMinutes: 90,
      passingMarks: 40,
      negativeMarks: 0,
      status: "DRAFT",
      description: "सरळसेवा भरती १०० गुणांचा मास्टर सराव पेपर ०२ (Draft).",
    },
    {
      title: "TCS / IBPS Quantitative Aptitude & Reasoning 100-Question Grand Mock 01 (अंकगणित व बुद्धिमत्ता - ०१)",
      slug: "tcs-ibps-maths-reasoning-01",
      examType: "SARALSEVA",
      durationMinutes: 90,
      passingMarks: 40,
      negativeMarks: 0,
      status: "DRAFT",
      description: "TCS/IBPS पॅटर्न अंकगणित व बुद्धिमत्ता १०० प्रश्न संच ०१ (Draft).",
    },
    {
      title: "TCS / IBPS Quantitative Aptitude & Reasoning 100-Question Grand Mock 02 (अंकगणित व बुद्धिमत्ता - ०२)",
      slug: "tcs-ibps-maths-reasoning-02",
      examType: "SARALSEVA",
      durationMinutes: 90,
      passingMarks: 40,
      negativeMarks: 0,
      status: "DRAFT",
      description: "TCS/IBPS पॅटर्न अंकगणित व बुद्धिमत्ता १०० प्रश्न संच ०२ (Draft).",
    },
  ];

  console.warn(`🚀 Seeding ${examsMeta.length} Exams (10 LIVE, 17 DRAFT) with 100 Syllabus-Verified Questions Each...`);

  let totalQuestionsCount = 0;

  for (let idx = 0; idx < examsMeta.length; idx++) {
    const meta = examsMeta[idx];
    const questions100 = generate100Questions(meta.examType, idx);

    const exam = await prismaClient.exam.upsert({
      where: { slug: meta.slug },
      update: {
        title: meta.title,
        status: meta.status,
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
        status: meta.status,
        createdBy: bhavishAdmin.id,
        description: meta.description,
      },
    });

    // Clear old links to re-link fresh questions with randomized option orders
    await prismaClient.examQuestion.deleteMany({
      where: { examId: exam.id },
    });
    await prismaClient.examQuestionSnapshot.deleteMany({
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
        include: {
          options: true,
        },
      });

      // Find the ID of the correct option
      const correctOption = createdQ.options.find((o) => o.isCorrect);

      // Create ExamQuestion record
      await prismaClient.examQuestion.create({
        data: {
          examId: exam.id,
          questionId: createdQ.id,
          questionOrder: q.qNum,
          marks: 1,
          negativeMarks: meta.negativeMarks,
        },
      });

      // Create Snapshot for fast CBT attempt delivery
      await prismaClient.examQuestionSnapshot.create({
        data: {
          examId: exam.id,
          sourceQuestionId: createdQ.id,
          position: q.qNum,
          marks: 1,
          negativeMarks: meta.negativeMarks,
          snapshot: {
            id: createdQ.id,
            questionText: q.qText,
            questionTextMr: q.qTextMr,
            explanation: q.expMr,
            explanationMr: q.expMr,
            marks: 1,
            negativeMarks: meta.negativeMarks,
            subject: q.subject,
            correctOptionId: correctOption?.id || null,
            options: createdQ.options.map((o) => ({
              id: o.id,
              text: o.optionText,
              textMr: o.optionTextMr,
              order: o.optionOrder,
              isCorrect: o.isCorrect,
            })),
          },
        },
      });

      totalQuestionsCount++;
    }
  }

  // Practice Notification
  await prismaClient.notification.create({
    data: {
      title: "🎯 १० महासराव परीक्षा थेट लाइव्ह!",
      message: "पोलीस भरती, एमपीएससी राज्यसेवा, संयुक्त गट ब व क, तलाठी आणि जिल्हा परिषद परीक्षांचे १० संपूर्ण १०० प्रश्नांचे पेपर्स लाइव्ह झाले आहेत. लगेच सराव सुरू करा!",
      type: "FREE_EXAM",
      scheduledAt: new Date(),
      data: {
        url: "/student/exams",
        badge: "10 Live Mega Mocks",
      },
    },
  });

  console.warn(`🎉 Seeding Complete: 10 LIVE Exams and 17 Draft Exams created (${totalQuestionsCount} Questions with Randomized Answer Keys).`);

  return {
    success: true,
    totalExamsSeeded: examsMeta.length,
    liveExams: 10,
    draftExams: 17,
    totalQuestionsSeeded: totalQuestionsCount,
    superAdminEmail: bhavishAdmin.email,
  };
}
