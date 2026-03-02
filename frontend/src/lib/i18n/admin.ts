/**
 * Admin panel translations — EN / FR
 * Usage: t(key) returns the localized string for the current locale.
 */
import type { SupportedLocale } from '$types/i18n';

const messages = {
	// ─── Layout / Sidebar ────────────────────────────────────
	'nav.dashboard': { en: 'Dashboard', fr: 'Tableau de bord' },
	'nav.paths': { en: 'Learning Paths', fr: "Parcours d'apprentissage" },
	'nav.import': { en: 'Import', fr: 'Importer' },
	'nav.viewSite': { en: 'View Site', fr: 'Voir le site' },
	'nav.logout': { en: 'Logout', fr: 'Déconnexion' },

	// ─── Theme ───────────────────────────────────────────────
	'theme.light': { en: 'Light', fr: 'Clair' },
	'theme.dark': { en: 'Dark', fr: 'Sombre' },
	'theme.system': { en: 'Auto', fr: 'Auto' },

	// ─── Login ───────────────────────────────────────────────
	'login.title': { en: 'Admin Portal', fr: "Portail d'administration" },
	'login.subtitle': { en: 'Enter your admin token to continue', fr: 'Entrez votre jeton admin pour continuer' },
	'login.label': { en: 'Admin Token', fr: 'Jeton admin' },
	'login.placeholder': { en: 'Enter admin token', fr: 'Entrez le jeton admin' },
	'login.submit': { en: 'Sign In', fr: 'Se connecter' },
	'login.verifying': { en: 'Verifying...', fr: 'Vérification...' },
	'login.backToSite': { en: 'Back to site', fr: 'Retour au site' },
	'login.invalidToken': { en: 'Invalid admin token', fr: 'Jeton admin invalide' },
	'login.serverError': { en: 'Server error', fr: 'Erreur serveur' },
	'login.connectError': { en: 'Cannot connect to API', fr: "Impossible de se connecter à l'API" },

	// ─── Dashboard ───────────────────────────────────────────
	'dashboard.title': { en: 'Dashboard', fr: 'Tableau de bord' },
	'dashboard.subtitle': { en: 'Content management overview', fr: "Vue d'ensemble du contenu" },
	'dashboard.learningPaths': { en: 'Learning Paths', fr: "Parcours d'apprentissage" },
	'dashboard.totalSteps': { en: 'Total Steps', fr: 'Total des étapes' },
	'dashboard.users': { en: 'Users', fr: 'Utilisateurs' },
	'dashboard.achievements': { en: 'Achievements', fr: 'Réalisations' },
	'dashboard.byDomain': { en: 'By Domain', fr: 'Par domaine' },
	'dashboard.byDifficulty': { en: 'By Difficulty', fr: 'Par difficulté' },
	'dashboard.noStats': { en: 'Cannot load stats. Is the API running?', fr: "Impossible de charger les stats. L'API fonctionne-t-elle ?" },
	'dashboard.importJson': { en: 'Import JSON', fr: 'Importer JSON' },
	'dashboard.newPath': { en: 'New Path', fr: 'Nouveau parcours' },
	'dashboard.noPathsYet': { en: 'No learning paths yet.', fr: "Aucun parcours d'apprentissage pour l'instant." },
	'dashboard.createFirst': { en: 'Create your first path', fr: 'Créez votre premier parcours' },

	// ─── Table headers ───────────────────────────────────────
	'table.title': { en: 'Title', fr: 'Titre' },
	'table.domain': { en: 'Domain', fr: 'Domaine' },
	'table.difficulty': { en: 'Difficulty', fr: 'Difficulté' },
	'table.steps': { en: 'Steps', fr: 'Étapes' },
	'table.xp': { en: 'XP', fr: 'XP' },
	'table.edit': { en: 'Edit', fr: 'Modifier' },

	// ─── Paths list ──────────────────────────────────────────
	'paths.title': { en: 'Learning Paths', fr: "Parcours d'apprentissage" },
	'paths.subtitle': { en: 'Manage your learning content', fr: 'Gérez vos contenus pédagogiques' },
	'paths.search': { en: 'Search paths...', fr: 'Rechercher des parcours...' },
	'paths.allDomains': { en: 'All domains', fr: 'Tous les domaines' },
	'paths.allDifficulties': { en: 'All difficulties', fr: 'Toutes les difficultés' },
	'paths.export': { en: 'Export', fr: 'Exporter' },
	'paths.delete': { en: 'Delete', fr: 'Supprimer' },
	'paths.confirmDelete': { en: 'Confirm?', fr: 'Confirmer ?' },
	'paths.steps': { en: 'steps', fr: 'étapes' },
	'paths.min': { en: 'min', fr: 'min' },
	'paths.noResults': { en: 'No paths match your filters.', fr: 'Aucun parcours ne correspond à vos filtres.' },
	'paths.totalPaths': { en: 'paths', fr: 'parcours' },
	'paths.totalSteps': { en: 'steps', fr: 'étapes' },
	'paths.totalXP': { en: 'total XP', fr: 'XP total' },

	// ─── Path editor ─────────────────────────────────────────
	'editor.pathDetails': { en: 'Path Details', fr: 'Détails du parcours' },
	'editor.metadata': { en: 'Metadata', fr: 'Métadonnées' },
	'editor.save': { en: 'Save Changes', fr: 'Enregistrer' },
	'editor.saving': { en: 'Saving...', fr: 'Enregistrement...' },
	'editor.saved': { en: 'Path updated', fr: 'Parcours mis à jour' },
	'editor.failedToSave': { en: 'Failed to save', fr: "Échec de l'enregistrement" },
	'editor.exportJson': { en: 'Export JSON', fr: 'Exporter JSON' },
	'editor.description': { en: 'Description', fr: 'Description' },
	'editor.estimatedMinutes': { en: 'Estimated Minutes', fr: 'Durée estimée (min)' },
	'editor.xpReward': { en: 'XP Reward', fr: 'Récompense XP' },
	'editor.mode': { en: 'Mode', fr: 'Mode' },
	'editor.backToPaths': { en: 'Back to Paths', fr: 'Retour aux parcours' },

	// ─── Steps ───────────────────────────────────────────────
	'steps.title': { en: 'Steps', fr: 'Étapes' },
	'steps.addNew': { en: 'Add Step', fr: 'Ajouter une étape' },
	'steps.edit': { en: 'Edit', fr: 'Modifier' },
	'steps.delete': { en: 'Delete Step', fr: "Supprimer l'étape" },
	'steps.cancel': { en: 'Cancel', fr: 'Annuler' },
	'steps.save': { en: 'Save Step', fr: "Enregistrer l'étape" },
	'steps.saving': { en: 'Saving...', fr: 'Enregistrement...' },
	'steps.hint': { en: 'Hint', fr: 'Indice' },
	'steps.type': { en: 'Type', fr: 'Type' },
	'steps.xp': { en: 'XP', fr: 'XP' },
	'steps.contentJson': { en: 'Content JSON', fr: 'Contenu JSON' },
	'steps.scenario': { en: 'Scenario', fr: 'Scénario' },
	'steps.theory': { en: 'Theory', fr: 'Théorie' },
	'steps.keyInsight': { en: 'Key Insight', fr: 'Point clé' },
	'steps.code': { en: 'Code', fr: 'Code' },
	'steps.newTitle': { en: 'Step title', fr: "Titre de l'étape" },
	'steps.creating': { en: 'Creating...', fr: 'Création...' },
	'steps.create': { en: 'Create', fr: 'Créer' },

	// ─── New path ────────────────────────────────────────────
	'newPath.title': { en: 'New Learning Path', fr: "Nouveau parcours d'apprentissage" },
	'newPath.subtitle': { en: 'Create a new path and start adding steps', fr: 'Créez un nouveau parcours et commencez à ajouter des étapes' },
	'newPath.pathTitle': { en: 'Path Title', fr: 'Titre du parcours' },
	'newPath.slug': { en: 'Slug', fr: 'Identifiant (slug)' },
	'newPath.create': { en: 'Create Path', fr: 'Créer le parcours' },
	'newPath.creating': { en: 'Creating...', fr: 'Création...' },

	// ─── Import ──────────────────────────────────────────────
	'import.title': { en: 'Import Learning Paths', fr: "Importer des parcours d'apprentissage" },
	'import.subtitle': { en: 'Upload JSON or Markdown files, or paste content directly', fr: 'Importez des fichiers JSON ou Markdown, ou collez le contenu directement' },
	'import.dropZone': { en: 'Drop JSON or Markdown files here', fr: 'Déposez les fichiers JSON ou Markdown ici' },
	'import.orBrowse': { en: 'or click to browse', fr: 'ou cliquez pour parcourir' },
	'import.tabJson': { en: 'JSON', fr: 'JSON' },
	'import.tabMarkdown': { en: 'Markdown', fr: 'Markdown' },
	'import.jsonEditor': { en: 'JSON Editor', fr: 'Éditeur JSON' },
	'import.mdEditor': { en: 'Markdown Editor', fr: 'Éditeur Markdown' },
	'import.placeholder': { en: 'Paste JSON content here...', fr: 'Collez le contenu JSON ici...' },
	'import.mdPlaceholder': { en: 'Paste Markdown content here (use the template format)...', fr: 'Collez le contenu Markdown ici (utilisez le format du template)...' },
	'import.loadExample': { en: 'Load example format', fr: "Charger un format d'exemple" },
	'import.loadMdTemplate': { en: 'Load Markdown template', fr: 'Charger le template Markdown' },
	'import.downloadTemplate': { en: 'Download template', fr: 'Télécharger le template' },
	'import.preview': { en: 'Preview', fr: 'Aperçu' },
	'import.pathsDetected': { en: 'path(s) detected', fr: 'parcours détecté(s)' },
	'import.importing': { en: 'Importing...', fr: 'Importation...' },
	'import.importAll': { en: 'Import All', fr: 'Tout importer' },
	'import.results': { en: 'Import Results', fr: "Résultats de l'importation" },
	'import.success': { en: 'Success', fr: 'Succès' },
	'import.failed': { en: 'Failed', fr: 'Échec' },
	'import.goToPaths': { en: 'Go to Paths', fr: 'Voir les parcours' },
	'import.importMore': { en: 'Import More', fr: 'Importer plus' },
	'import.validating': { en: 'Validating...', fr: 'Validation...' },
	'import.schemaErrors': { en: 'Validation Errors', fr: 'Erreurs de validation' },
	'import.schemaWarnings': { en: 'Warnings', fr: 'Avertissements' },
	'import.parseError': { en: 'Parse Error', fr: "Erreur d'analyse" },
	'import.valid': { en: 'Valid', fr: 'Valide' },
	'import.invalid': { en: 'Invalid', fr: 'Invalide' },
	'import.stepsDetected': { en: 'steps', fr: 'étapes' },
	'import.convertedFromMd': { en: 'Converted from Markdown', fr: 'Converti depuis Markdown' },

	// ─── Common ──────────────────────────────────────────────
	'common.programming': { en: 'Programming', fr: 'Programmation' },
	'common.webDev': { en: 'Web Dev', fr: 'Développement Web' },
	'common.systems': { en: 'Systems', fr: 'Systèmes' },
	'common.stem': { en: 'STEM', fr: 'STEM' },
	'common.languages': { en: 'Languages', fr: 'Langues' },
	'common.beginner': { en: 'Beginner', fr: 'Débutant' },
	'common.intermediate': { en: 'Intermediate', fr: 'Intermédiaire' },
	'common.advanced': { en: 'Advanced', fr: 'Avancé' },
	'common.fixBroken': { en: 'Fix Broken', fr: 'Corriger un bug' },
	'common.problemFirst': { en: 'Problem First', fr: "Problème d'abord" },
	'common.reverseEngineer': { en: 'Reverse Engineer', fr: 'Rétro-ingénierie' },
	'common.goalTree': { en: 'Goal Tree', fr: "Arbre d'objectifs" },
} as const;

type MessageKey = keyof typeof messages;

/**
 * Create a translator function for a given locale.
 */
export function createAdminT(lang: SupportedLocale): (key: MessageKey) => string {
	return (key: MessageKey): string => {
		const entry = messages[key];
		if (!entry) return key;
		return entry[lang] ?? entry['en'] ?? key;
	};
}

export type AdminT = ReturnType<typeof createAdminT>;
