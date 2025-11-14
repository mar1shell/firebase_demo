// js/auth.js
// Sélection du formulaire
const loginForm = document.getElementById("login-form");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  const loginButton = document.getElementById("login-button");

  // Désactiver le bouton pour éviter les clics multiples
  loginButton.disabled = true;
  loginButton.textContent = "Logging in...";

  try {
    const userCredential = await auth.signInWithEmailAndPassword(
      email,
      password
    );
    const user = userCredential.user;

    // Connexion réussie
    alert(`Login successful! UID: ${user.uid}`);

    // Redirection vers la page de profil
    window.location.href = "profile.html";
  } catch (error) {
    // Gestion des erreurs
    let message = "";
    switch (error.code) {
      case "auth/user-not-found":
        message = "Utilisateur non trouvé.";
        break;
      case "auth/wrong-password":
        message = "Mot de passe incorrect.";
        break;
      case "auth/invalid-email":
        message = "Email invalide.";
        break;
      default:
        message = error.message;
    }
    alert(`Erreur: ${message}`);
  } finally {
    // Réactiver le bouton
    loginButton.disabled = false;
    loginButton.textContent = "Login";
  }
});
