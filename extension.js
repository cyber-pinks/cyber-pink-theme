const vscode = require('vscode');
const fs = require('fs').promises;
const path = require('path');

// Copyright (c) 2026　1abcdefggs (takaer)
// Licensed under the MIT License
// See LICENSE file in the project root for full license information

/**
 * Map token categories to TextMate scope arrays used in the theme.
 */
const SCOPE_MAP = {
  comment: ['comment', 'punctuation.definition.comment'],
  keyword: ['keyword', 'storage.type', 'storage.modifier'],
  operator: ['keyword.operator'],
  number: ['constant.numeric', 'constant.language', 'support.constant'],
  function: ['entity.name.function', 'meta.function-call', 'support.function'],
  type: ['entity.name.type', 'entity.name.class', 'support.type', 'support.class'],
  string: ['string', 'constant.other.symbol', 'constant.character'],
  tag: ['entity.name.tag', 'punctuation.definition.tag'],
  attribute: ['entity.other.attribute-name'],
  invalid: ['invalid', 'invalid.illegal'],
  variable: ['variable', 'string constant.other.placeholder']
};

/**
 * Infer the token category at the current cursor position using heuristics.
 * @param {vscode.TextDocument} doc
 * @param {vscode.Position} pos
 * @returns {string} token category key
 */
function inferTokenType(doc, pos) {
  const lineText = doc.lineAt(pos.line).text;
  const char = pos.character;

  // Check if inside a line comment
  const commentIndex = lineText.indexOf('//');
  if (commentIndex !== -1 && char > commentIndex) {
    return 'comment';
  }

  // Check if inside a string literal on this line
  const stringChars = ['"', "'", '`'];
  for (const delim of stringChars) {
    let inStr = false;
    let escaped = false;
    for (let i = 0; i < char; i++) {
      const c = lineText[i];
      if (c === '\\') {
        escaped = !escaped;
        continue;
      }
      if (c === delim && !escaped) {
        inStr = !inStr;
      }
      escaped = false;
    }
    if (inStr) return 'string';
  }

  let word = '';
  let wordRange = null;
  try {
    wordRange = doc.getWordRangeAtPosition(pos);
    word = wordRange ? doc.getText(wordRange) : '';
  } catch {
    word = '';
  }

  // Keyword check
  const keywords = [
    'const', 'let', 'var', 'function', 'class', 'interface', 'type',
    'extends', 'implements', 'import', 'export', 'from', 'return',
    'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break',
    'continue', 'try', 'catch', 'finally', 'throw', 'new', 'this',
    'super', 'typeof', 'instanceof', 'in', 'of', 'as', 'is',
    'async', 'await', 'yield', 'delete', 'void'
  ];
  if (keywords.includes(word)) return 'keyword';

  // Number check
  if (/^\d+(\.\d+)?$/.test(word)) return 'number';

  // Function call check: next non-whitespace char is (
  const afterCursor = lineText.substring(wordRange ? wordRange.end.character : char).trimStart();
  if (afterCursor.startsWith('(')) return 'function';

  // Type check: PascalCase identifiers are treated as types
  if (/^[A-Z]/.test(word)) return 'type';

  return 'variable';
}

/**
 * Accent color presets with base and hover colors.
 */
const PRESET_MAP = {
  pinkNeon:    { base: '#FF3399', hover: '#CC297A' },
  pinkSoft:    { base: '#D92B82', hover: '#AD2368' },
  cyanNeon:    { base: '#00F0FF', hover: '#00C3CC' },
  cyanSoft:    { base: '#00CCD9', hover: '#00A6AD' },

  greenNeon:   { base: '#5AFF19', hover: '#3DCC12' },
  amberNeon:   { base: '#FFC800', hover: '#CC9F00' },
  fuchsiaNeon: { base: '#CC1669', hover: '#990F4E' },
  blueNeon:    { base: '#00AEEF', hover: '#008BBF' }
};

/**
 * Apply the selected accent preset to the theme JSON.
 * @param {string} themePath
 * @param {string} presetName
 */
async function applyAccentPreset(themePath, presetName) {
  const config = vscode.workspace.getConfiguration('cyberPink.accent');
  const customColor = config.get('customColor', '#FF3399');
  const customHover = config.get('customHover', '#CC297A');

  const preset = PRESET_MAP[presetName];
  const baseColor = preset ? preset.base : customColor;
  const hoverColor = preset ? preset.hover : customHover;

  let raw;
  try {
    raw = await fs.readFile(themePath, 'utf8');
  } catch (err) {
    vscode.window.showErrorMessage(`Failed to read theme file: ${err.message}`);
    return;
  }

  // Replace base color (#FF3399) keeping alpha channels
  // Match #FF3399 followed by optional 2 hex chars (alpha)
  raw = raw.replace(/#FF3399([0-9a-fA-F]{2})?\b/g, (match, alpha) => {
    return alpha ? baseColor + alpha : baseColor;
  });

  // Replace hover color (#CC297A)
  raw = raw.replace(/#CC297A([0-9a-fA-F]{2})?\b/g, (match, alpha) => {
    return alpha ? hoverColor + alpha : hoverColor;
  });

  try {
    await fs.writeFile(themePath, raw);
  } catch (err) {
    vscode.window.showErrorMessage(`Failed to write theme file: ${err.message}`);
    return;
  }
}

/**
 * Map layer names to the theme color keys they control.
 */
const LAYER_MAP = {
  base: [
    'editor.background',
    'terminal.background',
    'terminalCursor.background',
    'breadcrumb.background'
  ],
  deep: [
    'activityBar.background',
    'statusBar.noFolderBackground',
    'titleBar.activeBackground',
    'titleBar.inactiveBackground',
    'peekViewEditor.background'
  ],
  mid: [
    'sideBar.background',
    'tab.inactiveBackground',
    'editorGroupHeader.tabsBackground',
    'panel.background',
    'peekViewResult.background',
    'peekViewTitle.background',
    'notificationCenterHeader.background'
  ],
  surface: [
    'sideBarSectionHeader.background',
    'menu.background',
    'button.secondaryBackground',
    'input.background',
    'inputValidation.infoBackground',
    'dropdown.background',
    'quickInput.background',
    'quickInputTitle.background',
    'editorWidget.background',
    'editorSuggestWidget.background',
    'debugToolBar.background',
    'notifications.background',
    'editorHoverWidget.background'
  ]
};

/**
 * Apply configured background layer colors to the theme JSON.
 * @param {string} themePath
 */
async function applyBackgroundLayers(themePath) {
  const config = vscode.workspace.getConfiguration('cyberPink.background');
  const layers = {
    base: config.get('base', '#000000'),
    deep: config.get('deep', '#08090f'),
    mid: config.get('mid', '#0d0e17'),
    surface: config.get('surface', '#111320')
  };

  let raw;
  try {
    raw = await fs.readFile(themePath, 'utf8');
  } catch (err) {
    vscode.window.showErrorMessage(`Failed to read theme file: ${err.message}`);
    return;
  }

  let theme;
  try {
    theme = JSON.parse(raw);
  } catch (err) {
    vscode.window.showErrorMessage(`Failed to parse theme JSON: ${err.message}`);
    return;
  }

  for (const [layer, color] of Object.entries(layers)) {
    const keys = LAYER_MAP[layer];
    if (!keys) continue;
    for (const key of keys) {
      if (key in theme.colors) {
        theme.colors[key] = color;
      }
    }
  }

  try {
    await fs.writeFile(themePath, JSON.stringify(theme, null, 2));
  } catch (err) {
    vscode.window.showErrorMessage(`Failed to write theme file: ${err.message}`);
  }
}

/**
 * Update the theme JSON file for the given token category.
 * @param {string} themePath
 * @param {string} category
 * @param {string} newColor
 */
async function updateThemeColor(themePath, category, newColor) {
  let raw;
  try {
    raw = await fs.readFile(themePath, 'utf8');
  } catch (err) {
    vscode.window.showErrorMessage(`Failed to read theme file: ${err.message}`);
    throw err;
  }

  let theme;
  try {
    theme = JSON.parse(raw);
  } catch (err) {
    vscode.window.showErrorMessage(`Failed to parse theme JSON: ${err.message}`);
    throw err;
  }

  const scopes = SCOPE_MAP[category] || SCOPE_MAP.variable;

  let entry = theme.tokenColors.find(item => {
    const itemScopes = Array.isArray(item.scope) ? item.scope : [item.scope];
    return itemScopes.some(s => scopes.includes(s));
  });

  if (entry) {
    entry.settings.foreground = newColor;
  } else {
    theme.tokenColors.push({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      scope: scopes,
      settings: { foreground: newColor }
    });
  }

  try {
    await fs.writeFile(themePath, JSON.stringify(theme, null, 2));
  } catch (err) {
    vscode.window.showErrorMessage(`Failed to write theme file: ${err.message}`);
    throw err;
  }
}

/**
 * Detect the currently active Cyber Pink theme and return its JSON path.
 */
function getActiveCyberPinkThemePath(context) {
  const config = vscode.workspace.getConfiguration('workbench');
  const currentThemeName = config.get('colorTheme');

  if (!currentThemeName) {
    vscode.window.showWarningMessage('Could not detect active theme.');
    return null;
  }

 
  if (!currentThemeName.includes('CYBER PINK')) {
  
    return null;
  }

}


async function activate(context) {

// Pink Neon
const applyPinkNeon = vscode.commands.registerCommand(
  'cyberPink.applyPinkNeon',
  () => {
    vscode.workspace.getConfiguration().update(
      'workbench.colorTheme',
      'CYBER PINK ▶ THEME — 💗 PINK NEON',
      true
    );
  }
);
context.subscriptions.push(applyPinkNeon);

// Pink Soft
const applyPinkSoft = vscode.commands.registerCommand(
  'cyberPink.applyPinkSoft',
  () => {
    vscode.workspace.getConfiguration().update(
      'workbench.colorTheme',
      'CYBER PINK ▶ THEME — 🌸 PINK SOFT',
      true
    );
  }
);
context.subscriptions.push(applyPinkSoft);

// Cyan Neon
const applyCyanNeon = vscode.commands.registerCommand(
  'cyberPink.applyCyanNeon',
  () => {
    vscode.workspace.getConfiguration().update(
      'workbench.colorTheme',
      'CYBER PINK ▶ THEME — 💙 CYAN NEON',
      true
    );
  }
);
context.subscriptions.push(applyCyanNeon);

// Cyan Soft
const applyCyanSoft = vscode.commands.registerCommand(
  'cyberPink.applyCyanSoft',
  () => {
    vscode.workspace.getConfiguration().update(
      'workbench.colorTheme',
      'CYBER PINK ▶ THEME — 🫧 CYAN SOFT',
      true
    );
  }
);
context.subscriptions.push(applyCyanSoft);

const cmd = vscode.commands.registerCommand(
  'cyberPink.editThemeColorAtCursor',
  async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage('No active editor');
      return;
    }

    const doc = editor.document;
    const pos = editor.selection.active;
    const category = inferTokenType(doc, pos);

    // get json path
    const themePath = getActiveCyberPinkThemePath(context);
    if (!themePath) return;

    let currentColor = '#ffffff';
    try {
      const raw = await fs.readFile(themePath, 'utf8');
      const theme = JSON.parse(raw);
      const scopes = SCOPE_MAP[category] || SCOPE_MAP.variable;
      const existing = theme.tokenColors.find(item => {
        const itemScopes = Array.isArray(item.scope) ? item.scope : [item.scope];
        return itemScopes.some(s => scopes.includes(s));
      });
      currentColor = existing ? existing.settings.foreground : '#ffffff';
    } catch (err) {
      currentColor = '#ffffff';
    }

    const newColor = await vscode.window.showInputBox({
      prompt: `Edit "${category}" theme color (hex)`,
      value: currentColor,
      validateInput: value => {
        return /^#([0-9A-Fa-f]{3,4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/i.test(value)
          ? null
          : 'Enter a valid hex color (e.g. #00f0ff)';
      }
    });

    if (!newColor) return;

    try {
      await updateThemeColor(themePath, category, newColor);
    } catch {
      return;
    }

    const reload = await vscode.window.showInformationMessage(
      `Updated "${category}" to ${newColor}. Reload to apply?`,
      'Reload'
    );
    if (reload === 'Reload') {
      vscode.commands.executeCommand('workbench.action.reloadWindow');
    }
  }
);
context.subscriptions.push(cmd);



  // -----------------------------
  // 1. Apply background layers
  // -----------------------------
  let themePath = getActiveCyberPinkThemePath(context);
  if (themePath) {
    await applyBackgroundLayers(themePath);
  }

  // -----------------------------
  // 2. Apply accent preset
  // -----------------------------
  const accentConfig = vscode.workspace.getConfiguration('cyberPink.accent');
  const currentPreset = accentConfig.get('preset', 'pinkNeon');

  if (themePath) {
    await applyAccentPreset(themePath, currentPreset);
  }

  // -----------------------------
  // 3. Register accent preset switcher
  // -----------------------------
  const presetCmd = vscode.commands.registerCommand(
    'cyberPink.switchAccentPreset',
    async () => {

      const presets = [
        { label: '💗 Pink Neon',    description: 'Accent: bright cyberpunk pink (#FF3399) — high-visibility glow', name: 'pinkNeon' },
        { label: '🌸 Pink Soft',    description: 'Accent: muted pink (#D92B82) — softer tone for long coding sessions', name: 'pinkSoft' },
        { label: '💙 Cyan Neon',    description: 'Accent: electric cyan (#00F0FF) — vivid neon glow with sharp contrast', name: 'cyanNeon' },
        { label: '🫧 Cyan Soft',    description: 'Accent: calm cyan (#00CCD9) — reduced saturation for relaxed visibility', name: 'cyanSoft' },
        { label: '🟢 Green Neon',   description: 'Accent: lime green (#5AFF19) — energetic, high-visibility highlight', name: 'greenNeon' },
        { label: '🟡 Amber Neon',   description: 'Accent: warm amber (#FFC800) — warning-style cyber glow', name: 'amberNeon' },
        { label: '💜 Fuchsia Neon', description: 'Accent: deep fuchsia (#CC1669) — bold, intense cyberpunk tone', name: 'fuchsiaNeon' },
        { label: '🔵 Blue Neon',    description: 'Accent: cool blue (#00AEEF) — clean, futuristic highlight', name: 'blueNeon' },
        { label: '🎨 Custom Palette', description: 'Accent: choose any color — default is white (#FFFFFF) for visibility', name: 'custom' }
      ];

      const selected = await vscode.window.showQuickPick(presets, {
        placeHolder: 'Select an accent color preset'
      });

      if (!selected) return;

      await accentConfig.update('preset', selected.name, true);

      themePath = getActiveCyberPinkThemePath(context);
      if (!themePath) return;

      await applyAccentPreset(themePath, selected.name);

      const reload = await vscode.window.showInformationMessage(
        `Switched to ${selected.label} (${selected.description}). Reload to apply?`,
        'Reload'
      );
      if (reload === 'Reload') {
        vscode.commands.executeCommand('workbench.action.reloadWindow');
      }
    }
  );
  context.subscriptions.push(presetCmd);


  // -----------------------------
  // 4. Watch for config changes
  // -----------------------------
  const configListener = vscode.workspace.onDidChangeConfiguration(async event => {

    themePath = getActiveCyberPinkThemePath(context);
    if (!themePath) return;

    if (event.affectsConfiguration('cyberPink.background')) {
      await applyBackgroundLayers(themePath);
      const reload = await vscode.window.showInformationMessage(
        'Cyber Pink background layers updated. Reload to apply?',
        'Reload'
      );
      if (reload === 'Reload') {
        vscode.commands.executeCommand('workbench.action.reloadWindow');
      }
    }

    if (event.affectsConfiguration('cyberPink.accent')) {
      const newAccentConfig = vscode.workspace.getConfiguration('cyberPink.accent');
      const newPreset = newAccentConfig.get('preset', 'pinkNeon');
      await applyAccentPreset(themePath, newPreset);

      const reload = await vscode.window.showInformationMessage(
        'Cyber Pink accent preset updated. Reload to apply?',
        'Reload'
      );
      if (reload === 'Reload') {
        vscode.commands.executeCommand('workbench.action.reloadWindow');
      }
    }
  });

  context.subscriptions.push(configListener);
}

function deactivate() {}

module.exports = { activate, deactivate };
