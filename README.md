<div align="center">
  <img src="./icons/icon.png" alt="Pandu Logo" width="120" height="120">
  
  # Pandu VSCode Extension
  
  *Comprehensive language support for **Pandu** programming language*
  
  ![VSCode Marketplace](https://img.shields.io/badge/VSCode-Marketplace-blue?style=flat-square&logo=visual-studio-code)
  ![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)
  ![Version](https://img.shields.io/badge/version-0.0.1-orange?style=flat-square)
</div>

---

## ✨ Features

<table>
<tr>
<td width="50%">

**🎨 Syntax Highlighting**

- Full syntax coloring optimized for One Dark Pro
- Control flow, declarations, types, and operators
- String literals, comments, and function calls

</td>
<td width="50%">

**⚡ Smart Indentation**

- Python-style auto-indentation after colons (`:`)
- Automatic bracket pairing and quote completion
- Smart comment block handling

</td>
</tr>
</table>

## 🔧 Language Support

<div align="center">
<table>
<tr>
<th width="25%">Control Flow</th>
<th width="25%">Declarations</th>
<th width="25%">Data Types</th>
<th width="25%">Operators</th>
</tr>
<tr>
<td align="center">
<code>if</code><br>
<code>elif</code><br>
<code>else</code><br>
<code>while</code><br>
<code>for</code><br>
<code>return</code>
</td>
<td align="center">
<code>struct</code><br>
<code>func</code><br>
<code>use</code><br>
<code>proto</code>
</td>
<td align="center">
<code>int</code><br>
<code>float</code><br>
<code>double</code><br>
<code>char</code><br>
<code>void</code>
</td>
<td align="center">
<code>==</code> <code>!=</code><br>
<code>&&</code> <code>||</code><br>
<code>+=</code> <code>-=</code><br>
<code><=</code> <code>>=</code>
</td>
</tr>
</table>
</div>

## 📖 Example

```ura
struct User:
    int id
    char name

func int main():
    User user
    user.id = 10

    if user.id == 10:
        output("Valid user")
    else:
        output("Invalid user")

    return 0
```

## 🎨 File Icons

Custom `.ura` file icons are included but optional:

1. Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. Select **"Preferences: File Icon Theme"** → **"Pandu Icons"**
3. Switch back to your preferred theme anytime

> **Note:** VSCode only supports one icon theme at a time, so you'll need to toggle between themes.

## 🚀 Getting Started

1. Create a new file with `.ura` extension
2. Start coding in Pandu - syntax highlighting will activate automatically
3. Use `Tab` for 4-space indentation (configured automatically)

---

<div align="center">

**[🐛 Report Issues](https://github.com/mohamedhrima/ura-vscode-extension/issues)** • **[💡 Suggest Features](https://github.com/mohamedhrima/ura-vscode-extension/issues/new)** • **[📚 GitHub Repository](https://github.com/mohamedhrima/ura-vscode-extension)**

</div>
