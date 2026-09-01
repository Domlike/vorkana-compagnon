/*
 * Earthdawn — configuration de la salle de jeu.
 *
 * Le paquet fonctionne immédiatement sur un même ordinateur sans remplir ce
 * fichier. Pour jouer depuis plusieurs appareils, suivre TUTORIEL_HEBERGEMENT.md
 * puis renseigner uniquement l'URL du projet et la clé *publishable* Supabase.
 * Ne jamais placer de clé "secret" ou "service_role" dans ce fichier.
 */
window.EARTHDAWN_REALTIME_CONFIG = Object.freeze({
  enabled: false,
  supabaseUrl: "",
  supabasePublishableKey: "",
  defaultRoom: "cale-chaos",
  playerBaseUrl: ""
});
