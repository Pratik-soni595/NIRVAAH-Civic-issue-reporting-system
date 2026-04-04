/**
 * Chatbot Frontend Interaction Logic
 */

document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("chatbotToggleBtn");
  const closeBtn = document.getElementById("chatbotCloseBtn");
  const chatWindow = document.getElementById("chatbotWindow");
  const chatForm = document.getElementById("chatbotForm");
  const chatInput = document.getElementById("chatInput");
  const messagesBox = document.getElementById("chatbotMessages");

  if (!toggleBtn || !closeBtn || !chatWindow || !messagesBox) return;

  let initialized = false;
  let welcomeLoaded = false;

  // Translation object
  const translations = {
    en: {
      questions: [
        {
          question: "How do I create a report?",
          answer:
            "Click on 'Add New Report' or 'Report an Issue' and fill out the form.",
          link: "/report",
          linkLabel: "Open page",
        },
        {
          question: "How can I edit my report?",
          answer: "Go to 'My Reports' from the dashboard to edit your reports.",
          link: "/my-complaints",
          linkLabel: "Open page",
        },
        {
          question: "How do I view all civic issues?",
          answer: "To see all civic issues and reports, visit our live map.",
          link: "/map",
          linkLabel: "Open page",
        },
        {
          question: "How do I login or signup?",
          answer:
            "You can log in or create a new free account from the login page.",
          link: "/login",
          linkLabel: "Open page",
        },
        {
          question: "How do points work?",
          answer:
            "NIRVAAH uses a points system! You earn points for reporting issues (+10) and getting upvotes (+2). Admins handle the resolutions. Check out the Leaderboard to see top citizens!",
          link: "/leaderboard",
          linkLabel: "Open page",
        },
        {
          question: "How to contact support?",
          answer:
            "You can reach out to our administration at support@nirvaah.com for any further questions.",
          link: null,
          linkLabel: "Open page",
        },
        {
          question: "What is this website about?",
          answer:
            "NIRVAAH is a community-driven platform to report local civic issues and earn points for keeping the community clean.",
          link: "/",
          linkLabel: "Open page",
        },
      ],
      responses: {
        welcome:
          'Hi! I am the NIRVAAH Assistant ⚡. How can I help you navigate today? Click one of the questions below or try typing "help".',
        hello:
          'Hello! How can I help you today? Type "help" to see what I can do.',
        home: 'You can go to the homepage here: <a href="/" class="chatbot-link-btn">Home</a>',
        complaints:
          'To see all civic issues and reports, visit our map: <a href="/map" class="chatbot-link-btn">Live Map</a>. Or view your reports at <a href="/my-complaints" class="chatbot-link-btn">My Reports</a>.',
        add: 'You can report a new civic issue here: <a href="/report" class="chatbot-link-btn">Report an Issue</a>',
        login:
          'You can log in to your account here: <a href="/login" class="chatbot-link-btn">Login Page</a>',
        register:
          'You can create a new free account here: <a href="/register" class="chatbot-link-btn">Register Page</a>',
        points:
          'NIRVAAH uses a points system! You earn points for reporting issues (+10) and getting upvotes (+2). Admins handle the resolutions. Check out the <a href="/leaderboard" class="chatbot-link-btn">Leaderboard</a> to see top citizens!',
        contact:
          "You can reach out to our administration at support@nirvaah.com for any further questions.",
        help: `Here are some things you can ask me:<br>
          • "home"<br>
          • "all complaints" or "reports"<br>
          • "report issue" or "add report"<br>
          • "login" / "register"<br>
          • "how do points work?"<br>
          • "contact"`,
        fallback:
          'Hmm, I am not sure about that. Did you mean "report", "login", or maybe you need "help"?',
        error: "Oops! Something went wrong on my end.",
        serverError: "Unable to connect to the server.",
        genericError: "Sorry, I encountered an error.",
      },
      placeholder: "Type a message...",
    },
    hi: {
      questions: [
        {
          question: "मैं रिपोर्ट कैसे बनाऊं?",
          answer:
            "'नई रिपोर्ट जोड़ें' या 'समस्या दर्ज करें' पर क्लिक करें और फॉर्म भरें।",
          link: "/report",
          linkLabel: "पेज खोलें",
        },
        {
          question: "मैं अपनी रिपोर्ट कैसे संपादित करूं?",
          answer:
            "डैशबोर्ड से 'मेरी शिकायतें' में जाकर अपनी रिपोर्ट संपादित करें।",
          link: "/my-complaints",
          linkLabel: "पेज खोलें",
        },
        {
          question: "मैं सभी नागरिक समस्याएं कैसे देखूं?",
          answer:
            "सभी नागरिक समस्याएं और रिपोर्ट देखने के लिए हमारे लाइव मैप पर जाएं।",
          link: "/map",
          linkLabel: "पेज खोलें",
        },
        {
          question: "मैं लॉग इन या साइन अप कैसे करूं?",
          answer: "आप लॉग इन पेज से नया मुफ्त खाता बना सकते हैं।",
          link: "/login",
          linkLabel: "पेज खोलें",
        },
        {
          question: "अंक कैसे काम करते हैं?",
          answer:
            'निर्वाह अंक प्रणाली का उपयोग करता है! आप समस्याओं की रिपोर्ट करने (+10) और अपवोट प्राप्त करने (+2) के लिए अंक अर्जित करते हैं। व्यवस्थापक समाधान संभालते हैं। शीर्ष नागरिकों को देखने के लिए <a href="/leaderboard" class="chatbot-link-btn">लीडरबोर्ड</a> देखें!',
          link: "/leaderboard",
          linkLabel: "पेज खोलें",
        },
        {
          question: "सहायता से संपर्क कैसे करें?",
          answer:
            "आप आगे के प्रश्नों के लिए हमारी प्रशासन से support@nirvaah.com पर संपर्क कर सकते हैं।",
          link: null,
          linkLabel: "पेज खोलें",
        },
        {
          question: "यह वेबसाइट किस बारे में है?",
          answer:
            "निर्वाह एक समुदाय-संचालित प्लेटफॉर्म है जो स्थानीय नागरिक समस्याओं की रिपोर्ट करने और समुदाय को साफ रखने के लिए अंक अर्जित करने के लिए है।",
          link: "/",
          linkLabel: "पेज खोलें",
        },
      ],
      responses: {
        welcome:
          'नमस्ते! मैं निर्वाह सहायक ⚡ हूं। आज आपकी नेविगेशन में कैसे मदद कर सकता हूं? नीचे दिए गए प्रश्नों में से एक पर क्लिक करें या "help" टाइप करके देखें।',
        hello:
          'नमस्ते! आज मैं आपकी कैसे मदद कर सकता हूं? मैं क्या कर सकता हूं यह देखने के लिए "help" टाइप करें।',
        home: 'आप यहां होमपेज पर जा सकते हैं: <a href="/" class="chatbot-link-btn">होम</a>',
        complaints:
          'सभी नागरिक समस्याएं और रिपोर्ट देखने के लिए हमारे मैप पर जाएं: <a href="/map" class="chatbot-link-btn">लाइव मैप</a>। या अपनी रिपोर्ट यहां देखें <a href="/my-complaints" class="chatbot-link-btn">मेरी रिपोर्ट</a>।',
        add: 'आप यहां नई नागरिक समस्या रिपोर्ट कर सकते हैं: <a href="/report" class="chatbot-link-btn">समस्या दर्ज करें</a>',
        login:
          'आप यहां अपने खाते में लॉग इन कर सकते हैं: <a href="/login" class="chatbot-link-btn">लॉग इन पेज</a>',
        register:
          'आप यहां नया मुफ्त खाता बना सकते हैं: <a href="/register" class="chatbot-link-btn">रजिस्टर पेज</a>',
        points:
          'निर्वाह अंक प्रणाली का उपयोग करता है! आप समस्याओं की रिपोर्ट करने (+10) और अपवोट प्राप्त करने (+2) के लिए अंक अर्जित करते हैं। व्यवस्थापक समाधान संभालते हैं। शीर्ष नागरिकों को देखने के लिए <a href="/leaderboard" class="chatbot-link-btn">लीडरबोर्ड</a> देखें!',
        contact:
          "आप आगे के प्रश्नों के लिए हमारी प्रशासन से support@nirvaah.com पर संपर्क कर सकते हैं।",
        help: `मैं आपसे ये पूछ सकता हूं:<br>
          • "home"<br>
          • "all complaints" या "reports"<br>
          • "report issue" या "add report"<br>
          • "login" / "register"<br>
          • "how do points work?"<br>
          • "contact"`,
        fallback:
          'हम्म, मुझे इस बारे में यकीन नहीं है। क्या आपका मतलब "report", "login", या शायद आपको "help" चाहिए?',
        error: "ओह! मेरी ओर से कुछ गलत हो गया।",
        serverError: "सर्वर से कनेक्ट नहीं हो पाया।",
        genericError: "माफ़ कीजिए, मुझे एक त्रुटि हुई।",
      },
      placeholder: "संदेश लिखें...",
    },
  };

  let currentLang = "en";

  const copy = translations.en.responses; // fallback

  const lang = (
    window.currentLangCode ||
    localStorage.getItem("nirvaah_lang") ||
    "en"
  ).startsWith("hi")
    ? "hi"
    : "en";
  currentLang = lang;

  const toggleChat = () => {
    const isActive = chatWindow.classList.contains("active");
    if (!isActive) {
      chatWindow.classList.add("active");
      toggleBtn.innerHTML = "✕";
      chatInput?.focus();
      if (!initialized) {
        initialized = true;
        initializeApp();
      } else {
        setTimeout(scrollToBottom, 50);
      }
    } else {
      chatWindow.classList.remove("active");
      toggleBtn.innerHTML = "💬";
    }
  };

  const switchLanguage = (lang) => {
    if (lang === currentLang) return;
    currentLang = lang;
    localStorage.setItem("nirvaah_chatbot_lang", lang);
    updateUI();
  };

  const updateUI = () => {
    // Update placeholder
    chatInput.placeholder = translations[currentLang].placeholder;
    // Update active button
    document.querySelectorAll(".lang-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.lang === currentLang);
    });
    // Re-render options
    renderQuestionOptions();
  };

  toggleBtn.addEventListener("click", toggleChat);
  closeBtn.addEventListener("click", toggleChat);

  // Language toggle
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => switchLanguage(btn.dataset.lang));
  });

  const initializeApp = async () => {
    showTyping();
    try {
      if (!welcomeLoaded) {
        const resWelcome = await fetch("/api/chatbot/message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "welcome" }),
        });
        const welcomeData = await resWelcome.json();
        if (welcomeData.success) {
          appendMessage(translations[currentLang].responses.welcome, "bot");
          welcomeLoaded = true;
        }
      }

      hideTyping();
      renderQuestionOptions(true);
    } catch (err) {
      hideTyping();
      appendMessage(
        translations[currentLang].responses.serverError,
        "bot",
        true,
      );
    }
  };

  const renderQuestionOptions = (autoScroll = true) => {
    const old = messagesBox.querySelector(".chatbot-options");
    if (old) old.remove();

    const optionsContainer = document.createElement("div");
    optionsContainer.className = "chatbot-options";

    translations[currentLang].questions.forEach((q) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chatbot-option-btn";
      btn.textContent = q.question;
      btn.onclick = () => handleQuestionClick(q);
      optionsContainer.appendChild(btn);
    });

    messagesBox.appendChild(optionsContainer);
    if (autoScroll) scrollToBottom();
  };

  const handleQuestionClick = (qData) => {
    appendMessage(qData.question, "user", true);
    let answerHtml = qData.answer;
    if (qData.link)
      answerHtml += `<br><br><a href="${qData.link}" class="chatbot-link-btn">${qData.linkLabel}</a>`;
    const botMsg = appendMessage(answerHtml, "bot", false);
    renderQuestionOptions(false);

    setTimeout(() => {
      botMsg.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  };

  if (chatForm) {
    chatForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const msg = chatInput.value.trim();
      if (!msg) return;

      appendMessage(msg, "user");
      chatInput.value = "";
      showTyping();

      try {
        const response = await fetch("/api/chatbot/message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: msg }),
        });
        const data = await response.json();
        hideTyping();
        const translatedReply = translateResponse(
          data.success ? data.reply : translations[currentLang].responses.error,
        );
        const botMsg = appendMessage(translatedReply, "bot", false);
        renderQuestionOptions(false);
        setTimeout(
          () => botMsg.scrollIntoView({ behavior: "smooth", block: "center" }),
          50,
        );
      } catch (err) {
        hideTyping();
        appendMessage(
          translations[currentLang].responses.serverError,
          "bot",
          true,
        );
      }
    });
  }

  const appendMessage = (text, sender, autoScroll = true) => {
    const div = document.createElement("div");
    div.className = `chat-bubble ${sender}`;
    div.innerHTML = text;
    messagesBox.appendChild(div);
    if (autoScroll) scrollToBottom();
    return div;
  };

  const translateResponse = (reply) => {
    // Simple translation by matching known responses
    const enResponses = translations.en.responses;
    const hiResponses = translations.hi.responses;
    for (let key in enResponses) {
      if (enResponses[key] === reply) {
        return currentLang === "hi" ? hiResponses[key] : reply;
      }
    }
    // If not found, return as is (since backend might send dynamic)
    return reply;
  };

  const showTyping = () => {
    hideTyping();
    const div = document.createElement("div");
    div.className = "chat-bubble bot typing-indicator";
    div.innerHTML =
      '<div class="chat-typing"><div class="chat-dot"></div><div class="chat-dot"></div><div class="chat-dot"></div></div>';
    div.id = "chatTyping";
    messagesBox.appendChild(div);
    scrollToBottom();
  };

  const hideTyping = () => document.getElementById("chatTyping")?.remove();
  const scrollToBottom = () => {
    messagesBox.scrollTop = messagesBox.scrollHeight;
  };

  // Initialize UI
  updateUI();
});
