// js/signup.js — version plus robuste
document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById("signup-form");
  const signupButton = document.getElementById("signup-button");
  const modeSignupBtn = document.getElementById("mode-signup");
  const modeLoginBtn = document.getElementById("mode-login");
  const confirmPasswordRow = document.getElementById("confirm-password-row");
  const extraSignupFields = document.getElementById("extra-signup-fields");
  const modeHint = document.getElementById("mode-hint");
  const formTitle = document.getElementById("form-title");
  const checkAccountBtn = document.getElementById("check-account");
  const mainContainer = document.getElementById("main-container");

  // elements to toggle validity
  const confirmPasswordInput = document.getElementById("signup-confirm-password");
  const signupUsernameInput = document.getElementById("signup-username");
  const signupBioInput = document.getElementById("signup-bio");

  // defensive: if a required element is missing, we log and avoid crashing
  function ensure(el, name) {
    if (!el) console.warn(`Element not found: ${name}`);
    return !!el;
  }

  // mode state: "signup" | "login"
  let mode = "signup";

  function setMode(newMode) {
    mode = newMode;

    // update layout if container exists
    if (mainContainer) {
      if (mode === "login") mainContainer.classList.add("reverse");
      else mainContainer.classList.remove("reverse");
    }

    // Buttons (if present)
    if (modeSignupBtn && modeLoginBtn) {
      if (mode === "signup") {
        modeSignupBtn.classList.add("active");
        modeSignupBtn.setAttribute("aria-pressed", "true");
        modeLoginBtn.classList.remove("active");
        modeLoginBtn.setAttribute("aria-pressed", "false");
      } else {
        modeLoginBtn.classList.add("active");
        modeLoginBtn.setAttribute("aria-pressed", "true");
        modeSignupBtn.classList.remove("active");
        modeSignupBtn.setAttribute("aria-pressed", "false");
      }
    }

    if (mode === "signup") {
      // Enable confirm password BEFORE showing to avoid validation issues
      if (confirmPasswordInput) {
        confirmPasswordInput.required = true;
        confirmPasswordInput.disabled = false;
      }
      if (confirmPasswordRow) confirmPasswordRow.style.display = "";
      if (extraSignupFields) extraSignupFields.style.display = "";

      if (signupButton) signupButton.textContent = "Sign Up";
      if (signupButton) {
        signupButton.classList.add("primary");
        signupButton.classList.remove("secondary");
      }
      if (modeHint) modeHint.textContent = "Create a new account to save your profile and access your space.";
      if (formTitle) formTitle.textContent = "Sign Up";
      if (checkAccountBtn) checkAccountBtn.style.display = "none";

      if (signupUsernameInput) signupUsernameInput.disabled = false;
      if (signupBioInput) signupBioInput.disabled = false;
    } else {
      // For login: disable & clear confirmPassword BEFORE hiding so browser won't validate it
      if (confirmPasswordInput) {
        confirmPasswordInput.required = false;
        confirmPasswordInput.value = "";        // clear value to be safe
        confirmPasswordInput.disabled = true;
      }
      if (confirmPasswordRow) confirmPasswordRow.style.display = "none";
      if (extraSignupFields) extraSignupFields.style.display = "none";

      if (signupButton) signupButton.textContent = "Log In";
      if (signupButton) {
        signupButton.classList.add("primary");
        signupButton.classList.remove("secondary");
      }
      if (modeHint) modeHint.textContent = "Log in to access your profile and personalized space.";
      if (formTitle) formTitle.textContent = "Log In";
      if (checkAccountBtn) checkAccountBtn.style.display = "";

      if (signupUsernameInput) signupUsernameInput.disabled = true;
      if (signupBioInput) signupBioInput.disabled = true;
    }
  }

  // attach listeners if elements exist
  if (modeSignupBtn) modeSignupBtn.addEventListener("click", () => setMode("signup"));
  if (modeLoginBtn) modeLoginBtn.addEventListener("click", () => setMode("login"));

  if (checkAccountBtn) {
    checkAccountBtn.addEventListener("click", async () => {
      const emailEl = document.getElementById("signup-email");
      const email = emailEl ? emailEl.value.trim() : "";
      if (!email) {
        alert("Veuillez saisir un email pour vérifier.");
        return;
      }

      checkAccountBtn.disabled = true;
      checkAccountBtn.textContent = "Vérification...";

      try {
        const methods = await auth.fetchSignInMethodsForEmail(email);
        if (methods && methods.length > 0) {
          alert(`Un compte existe pour cet email. Méthodes : ${methods.join(", ")}`);
        } else {
          alert("Aucun compte trouvé pour cet email.");
        }
      } catch (err) {
        alert("Erreur lors de la vérification : " + (err.message || err));
      } finally {
        checkAccountBtn.disabled = false;
        checkAccountBtn.textContent = "Vérifier le compte";
      }
    });
  }

  if (signupForm) {
    // prevent native validation focusing a hidden required control:
    // use JS validation or set novalidate on form; if you want browser validation keep novalidate removed
    // signupForm.setAttribute('novalidate', ''); // uncomment to disable built-in HTML5 validation

    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("signup-email")?.value.trim();
      const password = document.getElementById("signup-password")?.value;
      const confirmPassword = document.getElementById("signup-confirm-password")?.value;
      const username = document.getElementById("signup-username")?.value.trim();
      const bio = document.getElementById("signup-bio")?.value.trim();

      if (!email || !password) {
        alert("Veuillez renseigner un email et un mot de passe.");
        return;
      }

      if (mode === "signup" && confirmPasswordInput && password !== confirmPassword) {
        alert("Les mots de passe ne correspondent pas.");
        return;
      }

      if (signupButton) {
        signupButton.disabled = true;
        signupButton.textContent = mode === "signup" ? "Creating account..." : "Logging in...";
      }

      try {
        if (mode === "signup") {
          const userCredential = await auth.createUserWithEmailAndPassword(email, password);
          const user = userCredential.user;
          await db.collection("users").doc(user.uid).set({
            username: username || "",
            bio: bio || "",
            email: email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          });
          localStorage.setItem("username", username || "");
          localStorage.setItem("bio", bio || "");
          alert(" Account created successfully!");
          window.location.href = "profile.html";
        } else {
          const userCredential = await auth.signInWithEmailAndPassword(email, password);
          const user = userCredential.user;
          try {
            const doc = await db.collection("users").doc(user.uid).get();
            if (doc.exists) {
              localStorage.setItem("username", doc.data().username || "");
              localStorage.setItem("bio", doc.data().bio || "");
            }
          } catch (fireErr) {
            console.warn("Impossible de charger le profil utilisateur :", fireErr);
          }
          alert("Connexion réussie !");
          window.location.href = "profile.html";
        }
      } catch (error) {
        let message = "";
        switch (error.code) {
          case "auth/email-already-in-use": message = "Cet email est déjà utilisé."; break;
          case "auth/invalid-email": message = "Email invalide."; break;
          case "auth/weak-password": message = "Le mot de passe doit contenir au moins 6 caractères."; break;
          case "auth/user-not-found": message = "Aucun compte trouvé pour cet email."; break;
          case "auth/wrong-password": message = "Mot de passe incorrect."; break;
          default: message = error.message || String(error);
        }
        alert("Erreur: " + message);
      } finally {
        if (signupButton) {
          signupButton.disabled = false;
          signupButton.textContent = mode === "signup" ? "S'inscrire" : "Se connecter";
        }
      }
    });
  } else {
    console.warn("signupForm not found in DOM.");
  }

  // initial mode
  setMode("signup");
});
