/**
 * Chatbot Controller
 * Rule-based intent matching for NIRVAAH Assistant
 */

const fs = require('fs');
const path = require('path');

const getPredefinedResponse = (text) => {
  const input = text.toLowerCase().trim();

  // Basic matching rules
  if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
    return 'Hello! How can I help you today? Type "help" to see what I can do.';
  }
  if (input.includes('home')) {
    return 'You can go to the homepage here: <a href="/" class="text-primary fw-bold" style="text-decoration:underline">Home</a>';
  }
  if ((input.includes('complaint') || input.includes('report') || input.includes('reports') || input.includes('listings') || input.includes('listing')) && !input.includes('add')) {
    return 'To see all civic issues and reports, visit our map: <a href="/map" class="text-primary fw-bold" style="text-decoration:underline">Live Map</a>. Or view your reports at <a href="/my-complaints" class="text-primary fw-bold" style="text-decoration:underline">My Reports</a>.';
  }
  if (input.includes('add') || input.includes('create') || input.includes('new') || input.includes('submit')) {
    return 'You can report a new civic issue here: <a href="/report" class="text-primary fw-bold" style="text-decoration:underline">Report an Issue</a>';
  }
  if (input.includes('login') || input.includes('log in') || input.includes('signin') || input.includes('sign in')) {
    return 'You can log in to your account here: <a href="/login" class="text-primary fw-bold" style="text-decoration:underline">Login Page</a>';
  }
  if (input.includes('signup') || input.includes('sign up') || input.includes('register')) {
    return 'You can create a new free account here: <a href="/register" class="text-primary fw-bold" style="text-decoration:underline">Register Page</a>';
  }
  if (input.includes('price') || input.includes('point') || input.includes('gamification')) {
    return 'NIRVAAH uses a points system! You earn points for reporting issues (+10) and getting upvotes (+2). Admins handle the resolutions. Check out the <a href="/leaderboard" class="text-primary fw-bold" style="text-decoration:underline">Leaderboard</a> to see top citizens!';
  }
  if (input.includes('contact') || input.includes('support')) {
    return 'You can reach out to our administration at support@nirvaah.com for any further questions.';
  }
  if (input.includes('help') || input.includes('cmd') || input.includes('command')) {
    return `Here are some things you can ask me:<br>
      • "home"<br>
      • "all complaints" or "reports"<br>
      • "report issue" or "add report"<br>
      • "login" / "register"<br>
      • "how do points work?"<br>
      • "contact"`;
  }

  // Fallback
  return 'Hmm, I am not sure about that. Did you mean "report", "login", or maybe you need "help"?';
};

// @route   GET /api/chatbot/data
// @access  Public
exports.getChatbotData = (req, res) => {
  try {
    const dataPath = path.join(__dirname, '../chatbotData.json');
    const data = fs.readFileSync(dataPath, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    console.error('Error reading chatbot data:', error);
    res.status(500).json({ success: false, message: 'Failed to load chatbot data' });
  }
};

// @route   POST /api/chatbot/message
// @access  Public
exports.handleMessage = (req, res) => {
  try {
    const { action, message } = req.body;
    
    // Welcome payload when the chat opens
    if (action === 'welcome') {
      return res.json({ 
        success: true, 
        reply: 'Hi! I am the NIRVAAH Assistant ⚡. How can I help you navigate today? Click one of the questions below or try typing "help".' 
      });
    }

    if (!message) {
      return res.status(400).json({ success: false, reply: 'Please send a message.' });
    }

    const reply = getPredefinedResponse(message);
    res.json({ success: true, reply });
  } catch (error) {
    console.error('Chatbot Error:', error);
    res.status(500).json({ success: false, reply: 'Oops! Something went wrong on my end.' });
  }
};
