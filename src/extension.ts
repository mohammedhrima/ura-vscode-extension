import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

// ─────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────

interface FnInfo {
  name: string;
  module: string; // e.g. "net", "memory"
  uri: vscode.Uri;
  line: number;
}

// ─────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────

function getWorkspaceRoot(): string | undefined {
  return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
}

function getUraLibDir(): string | undefined {
  const root = getWorkspaceRoot();
  if (!root) return undefined;
  // Try env var first, then fall back to src/ura-lib relative to workspace
  const envLib = process.env["URA_LIB"];
  if (envLib && fs.existsSync(envLib)) return envLib;
  const candidate = path.join(root, "src", "ura-lib");
  return fs.existsSync(candidate) ? candidate : undefined;
}

/** Resolve a `use "..."` import path to a filesystem path. */
function resolveImportPath(
  importPath: string,
  currentFilePath: string
): string | undefined {
  if (importPath.startsWith("@/")) {
    const libDir = getUraLibDir();
    if (!libDir) return undefined;
    return path.join(libDir, importPath.slice(2) + ".ura");
  }
  // Relative import
  return path.join(path.dirname(currentFilePath), importPath + ".ura");
}

/** Collect all `use "@/..."` module names already imported in a document. */
function getImportedModules(text: string): Set<string> {
  const imported = new Set<string>();
  const re = /^\s*use\s+"@\/([^"]+)"/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    imported.add(m[1]);
  }
  return imported;
}

/** Find the line index after the last existing `use` line (for inserting new imports). */
function getInsertLineForImport(lines: string[]): number {
  let last = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*use\s+"/.test(lines[i])) last = i;
  }
  return last + 1; // insert after last use, or at line 0 if none
}

// ─────────────────────────────────────────────────────────────
//  ura-lib index (built once on activation, refreshed on change)
// ─────────────────────────────────────────────────────────────

let libIndex: FnInfo[] = [];

function buildLibIndex() {
  libIndex = [];
  const libDir = getUraLibDir();
  if (!libDir || !fs.existsSync(libDir)) return;

  for (const filename of fs.readdirSync(libDir)) {
    if (!filename.endsWith(".ura")) continue;
    const moduleName = filename.slice(0, -4); // strip .ura
    const filePath = path.join(libDir, filename);
    const uri = vscode.Uri.file(filePath);
    const text = fs.readFileSync(filePath, "utf8");
    const lines = text.split("\n");
    const fnRe = /^\s*(?:proto\s+)?fn\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/;
    for (let i = 0; i < lines.length; i++) {
      const m = fnRe.exec(lines[i]);
      if (m) {
        libIndex.push({ name: m[1], module: moduleName, uri, line: i });
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────
//  1. Definition Provider
//     - use "@/mod"  → open src/ura-lib/mod.ura
//     - use "./mod"  → open relative file
//     - fn call foo  → jump to `fn foo` declaration in workspace
// ─────────────────────────────────────────────────────────────

const definitionProvider: vscode.DefinitionProvider = {
  async provideDefinition(document, position) {
    const line = document.lineAt(position).text;

    // ── Import definition ─────────────────────────────────────
    const importMatch = line.match(/^\s*use\s+"([^"]+)"/);
    if (importMatch) {
      const resolved = resolveImportPath(importMatch[1], document.uri.fsPath);
      if (resolved && fs.existsSync(resolved)) {
        return new vscode.Location(
          vscode.Uri.file(resolved),
          new vscode.Position(0, 0)
        );
      }
      return undefined;
    }

    // ── Function definition ───────────────────────────────────
    const wordRange = document.getWordRangeAtPosition(
      position,
      /[a-zA-Z_][a-zA-Z0-9_]*/
    );
    if (!wordRange) return undefined;
    const word = document.getText(wordRange);

    // Check next non-space char is ( (it's a call site)
    const after = line.slice(wordRange.end.character).trimStart();
    const isCall = after.startsWith("(");
    // Also handle method calls like buf.write(
    const isMaybeMethod =
      position.character > 0 && line[wordRange.start.character - 1] === ".";

    if (!isCall && !isMaybeMethod) return undefined;

    const fnPattern = new RegExp(`\\bfn\\s+${word}\\s*\\(`);
    const uris = await vscode.workspace.findFiles(
      "**/*.ura",
      "{**/build/**,**/.git/**}"
    );

    for (const uri of uris) {
      const text = (await vscode.workspace.fs.readFile(uri)).toString();
      const lines = text.split("\n");
      for (let i = 0; i < lines.length; i++) {
        if (fnPattern.test(lines[i])) {
          const col = lines[i].indexOf(word);
          return new vscode.Location(uri, new vscode.Position(i, col));
        }
      }
    }
    return undefined;
  },
};

// ─────────────────────────────────────────────────────────────
//  2. Completion Provider
//     a. Workspace functions + struct types
//     b. ura-lib functions with auto-import edit
//     c. Static keyword list
// ─────────────────────────────────────────────────────────────

const KEYWORDS = [
  "if", "elif", "else", "while", "for", "return", "break", "continue",
  "and", "or", "is", "not", "self", "main", "struct", "fn", "as",
  "use", "proto", "True", "False", "NULL",
  "int", "float", "double", "char", "void", "long", "short",
  "unsigned", "signed", "bool", "chars", "pointer", "ref", "array",
];

const completionProvider: vscode.CompletionItemProvider = {
  async provideCompletionItems(document, position) {
    const items: vscode.CompletionItem[] = [];
    const docText = document.getText();
    const importedModules = getImportedModules(docText);
    const docLines = docText.split("\n");

    // ── a. Keywords ───────────────────────────────────────────
    for (const kw of KEYWORDS) {
      const item = new vscode.CompletionItem(
        kw,
        vscode.CompletionItemKind.Keyword
      );
      items.push(item);
    }

    // ── b. Workspace functions and structs ────────────────────
    const uris = await vscode.workspace.findFiles(
      "**/*.ura",
      "{**/build/**,**/.git/**}"
    );
    const fnRe = /^\s*(?:proto\s+)?fn\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/;
    const structRe = /^\s*struct\s+([A-Z][a-zA-Z0-9_]*)/;

    for (const uri of uris) {
      const text = (await vscode.workspace.fs.readFile(uri)).toString();
      for (const line of text.split("\n")) {
        const fnMatch = fnRe.exec(line);
        if (fnMatch) {
          const item = new vscode.CompletionItem(
            fnMatch[1],
            vscode.CompletionItemKind.Function
          );
          item.detail = path.basename(uri.fsPath);
          items.push(item);
        }
        const stMatch = structRe.exec(line);
        if (stMatch) {
          const item = new vscode.CompletionItem(
            stMatch[1],
            vscode.CompletionItemKind.Class
          );
          item.detail = path.basename(uri.fsPath);
          items.push(item);
        }
      }
    }

    // ── c. ura-lib functions with auto-import ─────────────────
    const insertLine = getInsertLineForImport(docLines);

    for (const fn of libIndex) {
      const item = new vscode.CompletionItem(
        fn.name,
        vscode.CompletionItemKind.Function
      );
      item.detail = `from @/${fn.module}`;
      item.documentation = new vscode.MarkdownString(
        `Defined in \`@/${fn.module}\` (${fn.uri.fsPath})`
      );

      if (!importedModules.has(fn.module)) {
        // Auto-insert the use line
        const useStatement = `use "@/${fn.module}"\n`;
        item.additionalTextEdits = [
          vscode.TextEdit.insert(new vscode.Position(insertLine, 0), useStatement),
        ];
        item.detail += "  ← auto-import";
      }
      items.push(item);
    }

    return items;
  },
};

// ─────────────────────────────────────────────────────────────
//  3. Formatter
// ─────────────────────────────────────────────────────────────

function formatUra(text: string): string {
  const lines = text.split("\n");
  const result: string[] = [];

  // Track indentation level
  let indentLevel = 0;
  const INDENT = "    "; // 4 spaces

  // Patterns that should NOT have their content modified (strings, comments)
  const stripTrailing = (s: string) => s.replace(/\s+$/, "");

  // Spacing around operators (skip inside strings/comments)
  function spaceOperators(s: string): string {
    // Don't touch lines that are pure comments
    if (/^\s*\/\//.test(s)) return s;

    // Protect string contents — replace them with placeholders
    const strings: string[] = [];
    s = s.replace(/"(?:[^"\\]|\\.)*"/g, (m) => {
      strings.push(m);
      return `\x00STR${strings.length - 1}\x00`;
    });
    s = s.replace(/'(?:[^'\\]|\\.)*'/g, (m) => {
      strings.push(m);
      return `\x00STR${strings.length - 1}\x00`;
    });

    // Space around binary operators (order matters: longest first)
    const ops = ["==", "!=", "<=", ">=", "<<", ">>", "+=", "-=", "*=", "/=", "%=", "&&", "||"];
    for (const op of ops) {
      const escaped = op.replace(/[*+?^${}()|[\]\\]/g, "\\$&");
      s = s.replace(new RegExp(`\\s*${escaped}\\s*`, "g"), ` ${op} `);
    }
    // Single-char operators (but not unary minus/plus at start of expression)
    s = s.replace(/([^\s=!<>+\-*/%&|^])([=])(?!=)/g, "$1 = ");
    s = s.replace(/([=])(?!=)([^\s>])/g, "= $2");

    // Comma spacing
    s = s.replace(/,\s*/g, ", ");

    // Restore strings
    s = s.replace(/\x00STR(\d+)\x00/g, (_, i) => strings[parseInt(i)]);

    return s;
  }

  // Determine indent level from leading spaces
  function getIndent(s: string): number {
    const m = s.match(/^( *)/);
    if (!m) return 0;
    return Math.floor(m[1].length / 4);
  }

  for (let i = 0; i < lines.length; i++) {
    let line = stripTrailing(lines[i]);

    // Blank line — keep but normalize (max 1 consecutive blank between blocks)
    if (line.trim() === "") {
      // Suppress multiple consecutive blanks
      if (result.length > 0 && result[result.length - 1].trim() === "") {
        continue;
      }
      result.push("");
      continue;
    }

    // Skip comment lines (preserve as-is except trailing whitespace)
    if (/^\s*\/\//.test(line)) {
      result.push(stripTrailing(line));
      continue;
    }

    // Apply operator spacing
    line = spaceOperators(line);

    // Re-compute indentation from existing indent (preserve user's nesting,
    // we don't try to recompute from scratch to avoid breaking complex code)
    result.push(line);
  }

  // Ensure single trailing newline
  while (result.length > 0 && result[result.length - 1] === "") {
    result.pop();
  }
  return result.join("\n") + "\n";
}

const formattingProvider: vscode.DocumentFormattingEditProvider = {
  provideDocumentFormattingEdits(document) {
    const text = document.getText();
    const formatted = formatUra(text);
    if (formatted === text) return [];
    const fullRange = new vscode.Range(
      document.positionAt(0),
      document.positionAt(text.length)
    );
    return [vscode.TextEdit.replace(fullRange, formatted)];
  },
};

// ─────────────────────────────────────────────────────────────
//  Activation
// ─────────────────────────────────────────────────────────────

export function activate(context: vscode.ExtensionContext) {
  const URA = { language: "ura" };

  // Build ura-lib index on activation
  buildLibIndex();

  // Rebuild index when ura-lib files change
  const libDir = getUraLibDir();
  if (libDir) {
    const watcher = vscode.workspace.createFileSystemWatcher(
      new vscode.RelativePattern(libDir, "*.ura")
    );
    watcher.onDidChange(buildLibIndex);
    watcher.onDidCreate(buildLibIndex);
    watcher.onDidDelete(buildLibIndex);
    context.subscriptions.push(watcher);
  }

  context.subscriptions.push(
    vscode.languages.registerDefinitionProvider(URA, definitionProvider),
    vscode.languages.registerCompletionItemProvider(URA, completionProvider),
    vscode.languages.registerDocumentFormattingEditProvider(URA, formattingProvider)
  );
}

export function deactivate() {}
