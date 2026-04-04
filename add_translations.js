const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, 'locales', 'en.json');
const hiPath = path.join(__dirname, 'locales', 'hi.json');

const en = require(enPath);
const hi = require(hiPath);

Object.assign(en, {
  "citizenFallback": "Citizen",
  "communityProgressReport": "Community Progress Report",
  "mockPotholeTitle": "Pothole near Market",
  "mockPotholeTag": "Pothole",
  "mockPotholeDist": "0.6 km",
  "mockWaterLeakTitle": "Water leak near Park",
  "mockWaterLeakTag": "Water leak",
  "mockWaterLeakDist": "1.2 km",
  "mockRoadDamageTitle": "Road damage near School",
  "mockRoadDamageTag": "Road damage",
  "mockRoadDamageDist": "1.8 km",
  "tipClearPhotosTitle": "Clear Photos",
  "tipClearPhotosDesc": "Take well-lit photos showing the full context of the issue.",
  "tipAccurateLocationTitle": "Accurate Location",
  "tipAccurateLocationDesc": "Use GPS for exact coordinates or place the pin precisely on the map.",
  "tipBriefDescriptionTitle": "Brief Description",
  "tipBriefDescriptionDesc": "Provide concise but detailed context to help authorities resolve it faster.",
  "tipAvoidDuplicatesTitle": "Avoid Duplicates",
  "tipAvoidDuplicatesDesc": "Check the nearby issues map before submitting to prevent redundant reports.",
  "profCompletion": "Profile Completion",
  "profActiveCitizen": "Active Citizen",
  "profPersonalInfo": "Personal Information",
  "profEmailAddr": "Email Address",
  "profPhoneNum": "Phone Number",
  "profPhoneOptional": "(Optional)",
  "profPhonePlaceholder": "+91 xxxxx xxxxx",
  "profLoc": "Location",
  "profLocAuto": "(Auto-detected)",
  "profLocPlaceholder": "New Delhi, India",
  "profCancel": "Cancel",
  "profAccountSec": "Account Security",
  "profChangePwd": "Change Password",
  "profUpdateAuthKey": "Update your authentication key",
  "profUpdateBtn": "Update",
  "profSignOut": "Sign Out",
  "profEndSession": "End your current session safely",
  "profLogoutBtn": "Logout",
  "profRecentActivity": "Recent Activity",
  "profMockLeakFixed": "Water Pipe Leak Fixed",
  "profMockLeakLoc": "Sector-4 Market",
  "profMock2d": "2d ago",
  "profMockPotholeRep": "Pothole Reported",
  "profMockPotholeLoc": "Main Avenue Road",
  "profMock4d": "4d ago"
});

Object.assign(hi, {
  "citizenFallback": "नागरिक",
  "communityProgressReport": "सामुदायिक प्रगति रिपोर्ट",
  "mockPotholeTitle": "बाजार के पास गड्ढा",
  "mockPotholeTag": "गड्ढा",
  "mockPotholeDist": "0.6 किमी",
  "mockWaterLeakTitle": "पार्क के पास पानी का रिसाव",
  "mockWaterLeakTag": "पानी का रिसाव",
  "mockWaterLeakDist": "1.2 किमी",
  "mockRoadDamageTitle": "स्कूल के पास सड़क क्षतिग्रस्त",
  "mockRoadDamageTag": "क्षतिग्रस्त सड़क",
  "mockRoadDamageDist": "1.8 किमी",
  "tipClearPhotosTitle": "स्पष्ट तस्वीरें",
  "tipClearPhotosDesc": "समस्या का पूरा संदर्भ दिखाने वाली अच्छी रोशनी वाली तस्वीरें लें।",
  "tipAccurateLocationTitle": "सटीक स्थान",
  "tipAccurateLocationDesc": "सटीक निर्देशांक के लिए GPS का उपयोग करें या मानचित्र पर पिन को ठीक से रखें।",
  "tipBriefDescriptionTitle": "संक्षिप्त विवरण",
  "tipBriefDescriptionDesc": "अधिकारियों को इसे तेजी से हल करने में मदद करने के लिए संक्षिप्त लेकिन विस्तृत संदर्भ दें।",
  "tipAvoidDuplicatesTitle": "डुप्लिकेट से बचें",
  "tipAvoidDuplicatesDesc": "अनावश्यक रिपोर्टों को रोकने के लिए सबमिट करने से पहले आस-पास की समस्याओं के मानचित्र की जांच करें।",
  "profCompletion": "प्रोफ़ाइल पूर्णता",
  "profActiveCitizen": "सक्रिय नागरिक",
  "profPersonalInfo": "व्यक्तिगत जानकारी",
  "profEmailAddr": "ईमेल पता",
  "profPhoneNum": "फोन नंबर",
  "profPhoneOptional": "(वैकल्पिक)",
  "profPhonePlaceholder": "+91 xxxxx xxxxx",
  "profLoc": "स्थान",
  "profLocAuto": "(स्वतः पता लगाया गया)",
  "profLocPlaceholder": "नई दिल्ली, भारत",
  "profCancel": "रद्द करें",
  "profAccountSec": "खाता सुरक्षा",
  "profChangePwd": "पासवर्ड बदलें",
  "profUpdateAuthKey": "अपनी प्रमाणीकरण कुंजी अपडेट करें",
  "profUpdateBtn": "अपडेट करें",
  "profSignOut": "साइन आउट",
  "profEndSession": "अपना वर्तमान सत्र सुरक्षित रूप से समाप्त करें",
  "profLogoutBtn": "लॉग आउट",
  "profRecentActivity": "हाल की गतिविधि",
  "profMockLeakFixed": "पानी के पाइप का रिसाव ठीक किया गया",
  "profMockLeakLoc": "सेक्टर-4 बाजार",
  "profMock2d": "2 दिन पहले",
  "profMockPotholeRep": "गड्ढे की रिपोर्ट की गई",
  "profMockPotholeLoc": "मुख्य एवेन्यू रोड",
  "profMock4d": "4 दिन पहले"
});

fs.writeFileSync(enPath, JSON.stringify(en, null, 2));
fs.writeFileSync(hiPath, JSON.stringify(hi, null, 2));

console.log('Translations updated successfully');
