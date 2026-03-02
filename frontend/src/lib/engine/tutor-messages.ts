import type { TutorAction } from '$types/tutor';
import type { SupportedLocale } from '$types/i18n';

type TutorMessageMap = Record<TutorAction, string>;

const messages: Record<SupportedLocale, TutorMessageMap> = {
	en: {
		OFFER_HINT: "Struggling? I have a hint that might help.",
		REVEAL_PARTIAL_THEORY: "Let me show you the concept behind this...",
		FAST_TRACK: "Nailed it! You clearly know this — let's skip ahead.",
		SUGGEST_DECOMPOSE: "This is complex. Let's break it into smaller pieces.",
		OFFER_PREREQUISITE_PATH:
			"This seems tough. There might be a foundational concept worth exploring first."
	},
	fr: {
		OFFER_HINT: "En difficulté ? J'ai un indice qui pourrait aider.",
		REVEAL_PARTIAL_THEORY: "Laissez-moi vous montrer le concept derrière ça...",
		FAST_TRACK: "Bien joué ! Vous maîtrisez ça — avançons.",
		SUGGEST_DECOMPOSE: "C'est complexe. Décomposons en morceaux plus petits.",
		OFFER_PREREQUISITE_PATH:
			"Ça semble difficile. Il y a peut-être un concept fondamental à explorer d'abord."
	}
};

export function getTutorMessage(action: TutorAction, locale: SupportedLocale): string {
	return messages[locale]?.[action] ?? messages.en[action];
}
