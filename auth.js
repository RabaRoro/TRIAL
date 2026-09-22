// auth.js
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyNoY7oqv_K4aSkZO_zT_0GISJXvLjEsUIxQ8GuACn6SU9gBUnA2RTTDeIu-xn_K8-3/exec"; // Insert your Web App URL here
const AUTH_KEY = "agency_student_auth";
const LAST_SYNC_KEY = "agency_last_sync_time";

let selectedAvatar = "🌸";

document.addEventListener("DOMContentLoaded", () => {
  checkAuthAndInitialize();
  updateHeaderAvatar();
});

function getStudentAuth() {
  const data = localStorage.getItem(AUTH_KEY);
  return data ? JSON.parse(data) : null;
}

function checkAuthAndInitialize() {
  const student = getStudentAuth();
  if (!student || !student.verified) {
    showAuthPopup();
  } else {
    checkAndTriggerDailySync(student);
  }
}

function selectAvatar(emoji) {
  selectedAvatar = emoji;
  const buttons = document.querySelectorAll(".avatar-option");
  buttons.forEach(btn => {
    if (btn.innerText.trim() === emoji) {
      btn.classList.add("border-red-800", "bg-red-100", "scale-110");
      btn.classList.remove("border-transparent");
    } else {
      btn.classList.remove("border-red-800", "bg-red-100", "scale-110");
      btn.classList.add("border-transparent");
    }
  });
}

function updateHeaderAvatar() {
  const student = getStudentAuth();
  const avatarEl = document.getElementById("user-avatar-display");
  if (avatarEl) {
    avatarEl.textContent = (student && student.verified && student.avatar) ? student.avatar : "🌸";
  }
}

function showAuthPopup() {
  if (document.getElementById("auth-modal-overlay")) return;

  const overlay = document.createElement("div");
  overlay.id = "auth-modal-overlay";
  overlay.className = "fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4";

  overlay.innerHTML = `
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-8 relative font-sans">
      <div class="text-center mb-6">
        <h2 class="text-2xl font-bold text-slate-800" id="auth-title">Student Registration</h2>
        <p class="text-xs text-slate-500 mt-1" id="auth-subtitle">Enter your details to sync your Kanji & Vocab performance.</p>
      </div>

      <!-- Registration Form -->
      <form id="form-register" onsubmit="handleRegistrationSubmit(event)" class="space-y-4">
        <div>
          <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Full Name</label>
          <input type="text" id="auth-name" required placeholder="John Doe" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-red-800 text-sm">
        </div>
        <div>
          <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Email Address</label>
          <input type="email" id="auth-email" required placeholder="student@example.com" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-red-800 text-sm">
        </div>
        <div>
          <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Batch Name</label>
          <input type="text" id="auth-batch" required placeholder="Batch 01" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-red-800 text-sm">
        </div>
        <div>
          <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Select Default Avatar</label>
          <div class="flex justify-between items-center bg-gray-50 p-2 rounded-lg border border-gray-200">
            <button type="button" onclick="selectAvatar('🌸')" class="avatar-option text-2xl p-2 rounded-full border-2 border-red-800 bg-red-100 scale-110 transition-all">🌸</button>
            <button type="button" onclick="selectAvatar('🥷')" class="avatar-option text-2xl p-2 rounded-full border-2 border-transparent transition-all">🥷</button>
            <button type="button" onclick="selectAvatar('🦊')" class="avatar-option text-2xl p-2 rounded-full border-2 border-transparent transition-all">🦊</button>
            <button type="button" onclick="selectAvatar('👺')" class="avatar-option text-2xl p-2 rounded-full border-2 border-transparent transition-all">👺</button>
            <button type="button" onclick="selectAvatar('⛩️')" class="avatar-option text-2xl p-2 rounded-full border-2 border-transparent transition-all">⛩️</button>
            <button type="button" onclick="selectAvatar('🍡')" class="avatar-option text-2xl p-2 rounded-full border-2 border-transparent transition-all">🍡</button>
          </div>
        </div>
        <button type="submit" id="btn-reg-submit" class="w-full bg-red-800 text-white py-3 font-bold rounded-lg hover:bg-red-900 transition-colors shadow">Submit & Send Code</button>
        <div class="text-center mt-3">
          <a href="#" onclick="toggleAuthView('verify')" class="text-xs text-red-800 underline font-medium hover:text-red-900">Already registered? Log in here</a>
        </div>
      </form>

      <!-- Verification Code Form -->
      <form id="form-verify" onsubmit="handleCodeVerificationSubmit(event)" class="space-y-4 hidden">
        <div>
          <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Registered Email Address</label>
          <input type="email" id="verify-email" required placeholder="student@example.com" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-red-800 text-sm">
        </div>
        <div>
          <div class="flex justify-between items-end mb-1">
            <label class="block text-xs font-bold uppercase text-slate-500">6-Character Verification Code</label>
            <a href="#" onclick="handleForgotCode(event)" class="text-xs text-red-800 underline font-medium hover:text-red-900">Forgot Code?</a>
          </div>
          <input type="text" id="verify-code" maxlength="7" required placeholder="XXX-XXX" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-red-800 text-center font-mono text-lg font-bold tracking-widest uppercase">
        </div>
        <button type="submit" id="btn-verify-submit" class="w-full bg-red-800 text-white py-3 font-bold rounded-lg hover:bg-red-900 transition-colors shadow">Verify Account</button>
        <div class="text-center mt-3">
          <a href="#" onclick="toggleAuthView('register')" class="text-xs text-slate-500 underline font-medium hover:text-red-800">← Back to Registration</a>
        </div>
      </form>

      <div id="auth-status-msg" class="hidden mt-4 p-3 rounded-lg text-center text-xs font-bold"></div>
    </div>
  `;
  document.body.appendChild(overlay);

  document.getElementById("verify-code").addEventListener("input", (e) => {
    let val = e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    if (val.length > 3) val = val.substring(0, 3) + "-" + val.substring(3, 6);
    e.target.value = val;
  });
}

function showUserProfilePopup() {
  if (document.getElementById("user-profile-modal")) return;
  const student = getStudentAuth();
  if (!student || !student.verified) {
    showAuthPopup();
    return;
  }

  const modal = document.createElement("div");
  modal.id = "user-profile-modal";
  modal.className = "fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4";

  modal.innerHTML = `
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative font-sans text-center">
      <button onclick="closeUserProfilePopup()" class="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none">&times;</button>
      
      <div class="w-20 h-20 rounded-full bg-red-100 border-4 border-red-800 flex items-center justify-center text-4xl mx-auto mb-4 shadow">
        ${student.avatar || '🌸'}
      </div>
      
      <h3 class="text-xl font-bold text-slate-800">${escapeHtml(student.name || 'Student')}</h3>
      <p class="text-sm text-slate-500 mt-1">${escapeHtml(student.email || '')}</p>

      <div class="mt-6">
        <button onclick="handleLogout()" class="w-full bg-red-800 text-white py-2.5 font-bold rounded-lg hover:bg-red-900 transition-colors shadow">
          Log Out
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function closeUserProfilePopup() {
  const modal = document.getElementById("user-profile-modal");
  if (modal) modal.remove();
}

function handleLogout() {
  closeUserProfilePopup();
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(LAST_SYNC_KEY);
  updateHeaderAvatar();
  showAuthPopup();
}

function escapeHtml(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function toggleAuthView(view) {
  const regForm = document.getElementById("form-register");
  const verifyForm = document.getElementById("form-verify");
  document.getElementById("auth-status-msg").classList.add("hidden");

  if (view === "verify") {
    regForm.classList.add("hidden");
    verifyForm.classList.remove("hidden");
    document.getElementById("auth-title").textContent = "Account Verification";
    document.getElementById("auth-subtitle").textContent = "Enter your email and code to log in.";
    const regEmail = document.getElementById("auth-email").value;
    if (regEmail) document.getElementById("verify-email").value = regEmail;
  } else {
    verifyForm.classList.add("hidden");
    regForm.classList.remove("hidden");
    document.getElementById("auth-title").textContent = "Student Registration";
    document.getElementById("auth-subtitle").textContent = "Enter your details to track your agency learning progress.";
  }
}

async function handleRegistrationSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById("btn-reg-submit");
  const email = document.getElementById("auth-email").value.trim();
  setLoadingState(btn, true, "Sending Code...");

  localStorage.setItem("pending_avatar", selectedAvatar);

  try {
    const res = await fetch(SCRIPT_URL, {
      redirect: "follow", method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ 
        action: "request_code", 
        name: document.getElementById("auth-name").value.trim(), 
        email: email, 
        batch: document.getElementById("auth-batch").value.trim() 
      })
    });
    const result = await res.json();

    if (result.success) {
      showMessage("Code sent! Please check your email inbox.", "success");
      setTimeout(() => toggleAuthView("verify"), 1200);
    } else if (result.exists) {
      showMessage(result.message, "error");
      setTimeout(() => toggleAuthView("verify"), 1800);
    } else {
      showMessage(result.message || "Failed to send code.", "error");
    }
  } catch (err) {
    showMessage("Network connection error.", "error");
  } finally {
    setLoadingState(btn, false, "Submit & Send Code");
  }
}

async function handleForgotCode(e) {
  e.preventDefault();
  const email = document.getElementById("verify-email").value.trim();
  if (!email) {
    showMessage("Enter your email address above to receive your code.", "error");
    return;
  }

  const btn = document.getElementById("btn-verify-submit");
  setLoadingState(btn, true, "Resending Code...");

  try {
    const res = await fetch(SCRIPT_URL, {
      redirect: "follow", method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "forgot_code", email: email })
    });
    
    let result = await res.json();
    showMessage(result.message, result.success ? "success" : "error");
  } catch (err) {
    showMessage("Network error while requesting code resend.", "error");
  } finally {
    setLoadingState(btn, false, "Verify Account");
  }
}

async function handleCodeVerificationSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById("btn-verify-submit");
  setLoadingState(btn, true, "Verifying...");

  try {
    const res = await fetch(SCRIPT_URL, {
      redirect: "follow", method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ 
        action: "verify_code", 
        email: document.getElementById("verify-email").value.trim(), 
        code: document.getElementById("verify-code").value.trim() 
      })
    });
    
    let result = await res.json();

    if (result.success) {
      const savedAvatar = localStorage.getItem("pending_avatar") || selectedAvatar || "🌸";
      const studentData = { ...result.user, avatar: savedAvatar, verified: true };
      localStorage.setItem(AUTH_KEY, JSON.stringify(studentData));
      localStorage.removeItem("pending_avatar");
      updateHeaderAvatar();

      showMessage("Account Verified! Loading application...", "success");
      setTimeout(() => {
        const overlay = document.getElementById("auth-modal-overlay");
        if (overlay) overlay.remove();
        checkAndTriggerDailySync(studentData, true);
      }, 1000);
    } else {
      showMessage(result.message || "Invalid Code.", "error");
    }
  } catch (err) {
    showMessage("Verification failed. Please check your network.", "error");
  } finally {
    setLoadingState(btn, false, "Verify Account");
  }
}

function checkAndTriggerDailySync(student, forceSync = false) {
  const lastSync = localStorage.getItem(LAST_SYNC_KEY);
  const SYNC_INTERVAL_MS = 0; // Immediate sync

  if (forceSync || !lastSync || (Date.now() - parseInt(lastSync, 10)) >= SYNC_INTERVAL_MS) {
    executeProgressSync(student);
  }
}

// Extracts overall stats, lesson stats, and troublesome words directly from app.js logic
function extractLessonPerformanceData() {
  return {
    lastUpdated: new Date().toISOString(),
    overallStats: (typeof getOverallStats === "function") ? getOverallStats() : null,
    lessonBreakdown: (typeof getLessonStats === "function") ? getLessonStats() : [],
    troublesomeWords: (typeof getTroublesomeWords === "function") ? getTroublesomeWords().slice(0, 50) : []
  };
}

async function executeProgressSync(student) {
  if (!student) student = getStudentAuth();
  if (!student) return;

  const comprehensiveData = extractLessonPerformanceData();

  try {
    const res = await fetch(SCRIPT_URL, {
      redirect: "follow", method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ 
        action: "sync_progress", 
        user: student, 
        breakdown: comprehensiveData 
      })
    });
    const result = await res.json();
    if (result.success) {
      localStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
      console.log("Full index dashboard performance synced to Google Sheets.");
    }
  } catch (e) {
    console.warn("Background sync offline.", e);
  }
}

function setLoadingState(btn, isLoading, text) {
  btn.disabled = isLoading;
  btn.innerText = text;
  btn.style.opacity = isLoading ? "0.7" : "1";
}

function showMessage(msg, type) {
  const el = document.getElementById("auth-status-msg");
  el.className = `mt-4 p-3 rounded-lg text-center text-xs font-bold ${type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`;
  el.textContent = msg;
}
