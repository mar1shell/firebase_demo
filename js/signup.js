// js/signup.js
// Sélection du formulaire
const signupForm = document.getElementById("signup-form");

signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;
  const confirmPassword = document.getElementById(
    "signup-confirm-password"
  ).value;
  const signupButton = document.getElementById("signup-button");

  // Vérifier que les mots de passe correspondent
  if (password !== confirmPassword) {
    alert("Les mots de passe ne correspondent pas.");
    return;
  }

  // Désactiver le bouton pour éviter les clics multiples
  signupButton.disabled = true;
  signupButton.textContent = "Creating account...";

  try {
    const userCredential = await auth.createUserWithEmailAndPassword(
      email,
      password
    );
    const user = userCredential.user;

    // Inscription réussie
    alert(`Account created successfully! UID: ${user.uid}`);

    // Redirection vers la page de profil
    window.location.href = "profile.html";
  } catch (error) {
    // Gestion des erreurs
    let message = "";
    switch (error.code) {
      case "auth/email-already-in-use":
        message = "Cet email est déjà utilisé.";
        break;
      case "auth/invalid-email":
        message = "Email invalide.";
        break;
      case "auth/weak-password":
        message = "Le mot de passe doit contenir au moins 6 caractères.";
        break;
      default:
        message = error.message;
    }
    alert(`Erreur: ${message}`);
  } finally {
    // Réactiver le bouton
    signupButton.disabled = false;
    signupButton.textContent = "Sign Up";
  }
});
