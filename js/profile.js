// js/profile.js
const profileContent = document.getElementById("profile-content");
const logoutButton = document.getElementById("logout-button");

// Vérifier l'état de l'authentification
auth.onAuthStateChanged((user) => {
  if (user) {
    // Utilisateur connecté - afficher ses informations
    displayUserInfo(user);
  } else {
    // Pas d'utilisateur connecté - rediriger vers la page de connexion
    window.location.href = "index.html";
  }
});

// Fonction pour afficher les informations de l'utilisateur
function displayUserInfo(user) {
  const createdAt = user.metadata.creationTime
    ? new Date(user.metadata.creationTime).toLocaleString("fr-FR")
    : "Non disponible";

  const lastSignIn = user.metadata.lastSignInTime
    ? new Date(user.metadata.lastSignInTime).toLocaleString("fr-FR")
    : "Non disponible";

  profileContent.innerHTML = `
    <div class="profile-info">
      <div class="info-row">
        <span class="info-label">Email:</span>
        <span class="info-value">${user.email}</span>
      </div>
      <div class="info-row">
        <span class="info-label">User ID:</span>
        <span class="info-value">${user.uid}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Email Verified:</span>
        <span class="info-value">${user.emailVerified ? "Yes ✓" : "No ✗"}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Account Created:</span>
        <span class="info-value">${createdAt}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Last Sign In:</span>
        <span class="info-value">${lastSignIn}</span>
      </div>
    </div>
  `;
}

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
