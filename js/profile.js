// js/profile.js
const profileContent = document.getElementById("profile-content");
const logoutButton = document.getElementById("logout-button");
const saveButton = document.getElementById("save-profile");
const editToggle = document.getElementById("edit-toggle");
const cancelButton = document.getElementById("cancel-edit");

// Small helpers
let editMode = false;

// Escape for safe insertion into innerHTML
function escapeHtml(unsafe) {
  if (unsafe == null) return "";
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Vérifier l'état de l'authentification
auth.onAuthStateChanged(async (user) => {
  if (user) {
    // Récupérer les données Firestore
    const userDoc = await db.collection("users").doc(user.uid).get();
    const data = userDoc.exists ? userDoc.data() : {};

    // Afficher les informations
    displayUserInfo(user, data);
  } else {
    // Pas d'utilisateur connecté - rediriger vers la page de connexion
    window.location.href = "index.html";
  }
});

// Render helper for readonly row (value rendered inside .info-value with data-field attr)
function renderInfoRow(label, value, field) {
  // Show empty string if value is missing (do NOT render placeholder text)
  const safe = escapeHtml(value == null ? "" : value);
  const display = safe;
  return `
    <div class="info-row">
      <span class="info-label">${label}:</span>
      <span class="info-value" data-field="${field}">${display}</span>
    </div>
  `;
}

// Fonction pour afficher les informations de l'utilisateur
function displayUserInfo(user, data) {
  const createdAt = user.metadata.creationTime
    ? new Date(user.metadata.creationTime).toLocaleString("fr-FR")
    : "";

  const lastSignIn = user.metadata.lastSignInTime
    ? new Date(user.metadata.lastSignInTime).toLocaleString("fr-FR")
    : "";

  profileContent.innerHTML = `
    <div class="profile-info">
      <div class="info-row"><span class="info-label">Email:</span> <span class="info-value" data-field="email">${escapeHtml(user.email || "")}</span></div>
      <div class="info-row"><span class="info-label">User ID:</span> <span class="info-value" data-field="userId">${escapeHtml(user.uid || "")}</span></div>
      <div class="info-row"><span class="info-label">Email Verified:</span> <span class="info-value" data-field="emailVerified">${user.emailVerified ? "Yes ✓" : "No ✗"}</span></div>
      <div class="info-row"><span class="info-label">Account Created:</span> <span class="info-value" data-field="accountCreated">${escapeHtml(createdAt)}</span></div>
      <div class="info-row"><span class="info-label">Last Sign In:</span> <span class="info-value" data-field="lastSignIn">${escapeHtml(lastSignIn)}</span></div>
      ${renderInfoRow("Username", data.username || "", "username")}
      ${renderInfoRow("Bio", data.bio || "", "bio")}
    </div>
  `;

  // Reset controls: only Modifier shown
  enterViewMode();
}

function enterViewMode() {
  editMode = false;
  editToggle.style.display = "inline-block";
  saveButton.style.display = "none";
  cancelButton.style.display = "none";
  saveButton.disabled = true;
  editToggle.textContent = "Modifier";
}

// Toggle into edit mode — show Save + Cancel, replace spans with inputs
editToggle.addEventListener("click", () => {
  const usernameSpan = profileContent.querySelector('[data-field="username"]');
  const bioSpan = profileContent.querySelector('[data-field="bio"]');
  if (!usernameSpan || !bioSpan) return;

  // Enter edit mode: hide modifier, show save+cancel
  editMode = true;
  editToggle.style.display = "none";
  saveButton.style.display = "inline-block";
  cancelButton.style.display = "inline-block";
  saveButton.disabled = false;

  // Use current text content (may be empty)
  const usernameVal = (usernameSpan.textContent || "").trim();
  const bioVal = (bioSpan.textContent || "").trim();

  usernameSpan.innerHTML = `<input id="inline-username" class="inline-input" value="${escapeHtml(usernameVal)}">`;
  bioSpan.innerHTML = `<textarea id="inline-bio" class="inline-input" rows="3">${escapeHtml(bioVal)}</textarea>`;
});

// Cancel editing: revert inputs to original text values (no save)
cancelButton.addEventListener("click", () => {
  const usernameSpan = profileContent.querySelector('[data-field="username"]');
  const bioSpan = profileContent.querySelector('[data-field="bio"]');
  if (!usernameSpan || !bioSpan) return;

  // If inputs exist, use their defaultValue (the value they had when created). Fallback to empty string.
  const inlineUsername = document.getElementById("inline-username");
  const inlineBio = document.getElementById("inline-bio");

  const usernameVal = inlineUsername ? (inlineUsername.defaultValue || "") : (usernameSpan.textContent || "");
  const bioVal = inlineBio ? (inlineBio.defaultValue || "") : (bioSpan.textContent || "");

  usernameSpan.textContent = usernameVal;
  bioSpan.textContent = bioVal;

  enterViewMode();
});

// Save changes to Firestore — update lastSignIn reliably
saveButton.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return;

  const inlineUsername = document.getElementById("inline-username");
  const inlineBio = document.getElementById("inline-bio");

  const username = inlineUsername ? inlineUsername.value.trim() : (profileContent.querySelector('[data-field="username"]')?.textContent || "");
  const bio = inlineBio ? inlineBio.value.trim() : (profileContent.querySelector('[data-field="bio"]')?.textContent || "");

  // Build update object
  const updateData = {
    email: user.email || "",
    userId: user.uid || "",
    emailVerified: !!user.emailVerified,
    username: username,
    bio: bio
  };

  // Try to refresh auth metadata so lastSignInTime is up-to-date
  try {
    await user.reload(); // force refresh of metadata
  } catch (reloadErr) {
    // ignore reload error; we'll fallback to server timestamp below
    console.warn("Could not reload user metadata:", reloadErr);
  }

  // Prefer auth metadata if available, otherwise serverTimestamp()
  try {
    if (user.metadata && user.metadata.creationTime) {
      updateData.accountCreated = firebase.firestore.Timestamp.fromDate(new Date(user.metadata.creationTime));
    } else {
      updateData.accountCreated = firebase.firestore.FieldValue.serverTimestamp();
    }

    if (user.metadata && user.metadata.lastSignInTime) {
      updateData.lastSignIn = firebase.firestore.Timestamp.fromDate(new Date(user.metadata.lastSignInTime));
    } else {
      // fallback to server timestamp to ensure a persistent value
      updateData.lastSignIn = firebase.firestore.FieldValue.serverTimestamp();
    }
  } catch (err) {
    // Fallback to server timestamps if conversion fails
    updateData.accountCreated = firebase.firestore.FieldValue.serverTimestamp();
    updateData.lastSignIn = firebase.firestore.FieldValue.serverTimestamp();
  }

  saveButton.disabled = true;
  saveButton.textContent = "Saving...";

  try {
    await db.collection("users").doc(user.uid).set(updateData, { merge: true });

    // Update UI using latest metadata if present
    const usernameSpan = profileContent.querySelector('[data-field="username"]');
    const bioSpan = profileContent.querySelector('[data-field="bio"]');
    const emailSpan = profileContent.querySelector('[data-field="email"]');
    const userIdSpan = profileContent.querySelector('[data-field="userId"]');
    const emailVerifiedSpan = profileContent.querySelector('[data-field="emailVerified"]');
    const accountCreatedSpan = profileContent.querySelector('[data-field="accountCreated"]');
    const lastSignInSpan = profileContent.querySelector('[data-field="lastSignIn"]');

    if (usernameSpan) usernameSpan.textContent = username;
    if (bioSpan) bioSpan.textContent = bio;
    if (emailSpan) emailSpan.textContent = user.email || "";
    if (userIdSpan) userIdSpan.textContent = user.uid || "";
    if (emailVerifiedSpan) emailVerifiedSpan.textContent = user.emailVerified ? "Yes ✓" : "No ✗";

    if (accountCreatedSpan) {
      accountCreatedSpan.textContent = user.metadata && user.metadata.creationTime
        ? new Date(user.metadata.creationTime).toLocaleString("fr-FR")
        : "";
    }
    if (lastSignInSpan) {
      lastSignInSpan.textContent = user.metadata && user.metadata.lastSignInTime
        ? new Date(user.metadata.lastSignInTime).toLocaleString("fr-FR")
        : "";
    }

    saveButton.textContent = "Save Changes";
    enterViewMode();

    alert("Profil mis à jour et tous les champs enregistrés dans Firestore !");
  } catch (error) {
    console.error("Error saving profile:", error);
    alert("Erreur lors de la sauvegarde : " + (error.message || error));
    saveButton.disabled = false;
    saveButton.textContent = "Save Changes";
  }
});

// Gestion de la déconnexion
logoutButton.addEventListener("click", async () => {
  logoutButton.disabled = true;
  logoutButton.textContent = "Logging out...";

  try {
    await auth.signOut();
    alert("Déconnexion réussie!");
    window.location.href = "index.html";
  } catch (error) {
    alert(`Erreur lors de la déconnexion: ${error.message}`);
    logoutButton.disabled = false;
    logoutButton.textContent = "Logout";
  }
});