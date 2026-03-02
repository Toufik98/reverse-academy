import { EditorView } from 'codemirror';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';

/**
 * Custom CodeMirror 6 theme for Reverse Academy
 * Matches the design system tokens from tokens.css
 */

// Dark theme
const darkEditorTheme = EditorView.theme(
	{
		'&': {
			backgroundColor: '#0c0c0e',
			color: '#e8e6e3',
			fontSize: 'var(--text-sm)',
			fontFamily: "'JetBrains Mono', ui-monospace, monospace"
		},
		'.cm-content': {
			caretColor: '#d4a843',
			lineHeight: '1.5',
			padding: '12px 0'
		},
		'.cm-cursor, .cm-dropCursor': {
			borderLeftColor: '#d4a843',
			borderLeftWidth: '2px'
		},
		'&.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
			backgroundColor: '#d4a84330'
		},
		'.cm-activeLine': {
			backgroundColor: '#111113'
		},
		'.cm-gutters': {
			backgroundColor: '#0c0c0e',
			color: '#5c5b58',
			border: 'none',
			paddingRight: '8px'
		},
		'.cm-activeLineGutter': {
			backgroundColor: '#111113',
			color: '#9b9a97'
		},
		'.cm-foldPlaceholder': {
			backgroundColor: '#222226',
			color: '#9b9a97',
			border: 'none'
		},
		'.cm-tooltip': {
			backgroundColor: '#1a1a1d',
			border: '1px solid #222226',
			borderRadius: '6px'
		},
		'.cm-tooltip-autocomplete': {
			'& > ul > li[aria-selected]': {
				backgroundColor: '#d4a84320'
			}
		},
		'.cm-line-error': {
			backgroundColor: '#c4554d15'
		},
		'.cm-line-success': {
			backgroundColor: '#6b8f7115'
		}
	},
	{ dark: true }
);

const darkHighlightStyle = HighlightStyle.define([
	{ tag: t.keyword, color: '#c4a7e7' },
	{ tag: t.operator, color: '#c4a7e7' },
	{ tag: t.string, color: '#a8c99c' },
	{ tag: t.regexp, color: '#a8c99c' },
	{ tag: t.function(t.variableName), color: '#e2bc5a' },
	{ tag: t.function(t.definition(t.variableName)), color: '#e2bc5a' },
	{ tag: t.comment, color: '#5c5b58', fontStyle: 'italic' },
	{ tag: t.lineComment, color: '#5c5b58', fontStyle: 'italic' },
	{ tag: t.blockComment, color: '#5c5b58', fontStyle: 'italic' },
	{ tag: t.typeName, color: '#7daecc' },
	{ tag: t.className, color: '#7daecc' },
	{ tag: t.number, color: '#e2bc5a' },
	{ tag: t.bool, color: '#c4a7e7' },
	{ tag: t.null, color: '#c4a7e7' },
	{ tag: t.propertyName, color: '#e8e6e3' },
	{ tag: t.definition(t.variableName), color: '#e8e6e3' },
	{ tag: t.variableName, color: '#e8e6e3' },
	{ tag: t.punctuation, color: '#9b9a97' },
	{ tag: t.meta, color: '#9b9a97' },
	{ tag: t.tagName, color: '#c4a7e7' },
	{ tag: t.attributeName, color: '#e2bc5a' },
	{ tag: t.attributeValue, color: '#a8c99c' }
]);

// Light theme
const lightEditorTheme = EditorView.theme(
	{
		'&': {
			backgroundColor: '#f0efec',
			color: '#1a1a1d',
			fontSize: 'var(--text-sm)',
			fontFamily: "'JetBrains Mono', ui-monospace, monospace"
		},
		'.cm-content': {
			caretColor: '#b8892e',
			lineHeight: '1.5',
			padding: '12px 0'
		},
		'.cm-cursor, .cm-dropCursor': {
			borderLeftColor: '#b8892e',
			borderLeftWidth: '2px'
		},
		'&.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
			backgroundColor: '#b8892e20'
		},
		'.cm-activeLine': {
			backgroundColor: '#f2f1ee'
		},
		'.cm-gutters': {
			backgroundColor: '#f0efec',
			color: '#9b9a97',
			border: 'none',
			paddingRight: '8px'
		},
		'.cm-activeLineGutter': {
			backgroundColor: '#f2f1ee',
			color: '#6b6a67'
		}
	},
	{ dark: false }
);

const lightHighlightStyle = HighlightStyle.define([
	{ tag: t.keyword, color: '#7c5db8' },
	{ tag: t.operator, color: '#7c5db8' },
	{ tag: t.string, color: '#4a7050' },
	{ tag: t.regexp, color: '#4a7050' },
	{ tag: t.function(t.variableName), color: '#a07825' },
	{ tag: t.function(t.definition(t.variableName)), color: '#a07825' },
	{ tag: t.comment, color: '#9b9a97', fontStyle: 'italic' },
	{ tag: t.typeName, color: '#3d6f94' },
	{ tag: t.className, color: '#3d6f94' },
	{ tag: t.number, color: '#a07825' },
	{ tag: t.bool, color: '#7c5db8' },
	{ tag: t.null, color: '#7c5db8' },
	{ tag: t.propertyName, color: '#1a1a1d' },
	{ tag: t.variableName, color: '#1a1a1d' },
	{ tag: t.punctuation, color: '#6b6a67' }
]);

export const darkTheme = [darkEditorTheme, syntaxHighlighting(darkHighlightStyle)];
export const lightTheme = [lightEditorTheme, syntaxHighlighting(lightHighlightStyle)];
