# Ura Language Support for Visual Studio Code

Syntax highlighting and smart indentation support for the [Ura programming language](https://github.com/mohammedhrima/ura-lang) in Visual Studio Code.

> **This extension is fully vibe-coded.** Every line of it — the TextMate grammar,
> the language configuration, the build script and this README — was written by an
> AI assistant rather than by hand. The compiler it highlights is not; that one is
> written the old-fashioned way.

## Features

- **Syntax Highlighting** - Full syntax highlighting for `.ura` files
- **Smart Indentation** - Automatic indentation based on language structure
- **Auto-Closing Pairs** - Automatic closing of brackets, quotes, and parentheses
- **Comment Support** - Line (`//`) and block (`/* */`) comment toggling
- **Custom File Icons** - Distinctive icons for `.ura` files

## Installation

### Local Installation (Current)

1. Clone or download this repository
2. Build and install:
   ```bash
   make install
   ```
3. Restart VSCode completely (Cmd+Q on macOS, then reopen)
4. Open any `.ura` file

The extension will be installed to `~/.vscode/extensions/mohamedhrima.ura-lang-0.0.1/`

### Marketplace Installation (Coming Soon)

The extension will be available on the Visual Studio Code Marketplace.

## Language Overview

Ura is a statically-typed, compiled programming language that compiles to LLVM IR. It features Python-like indentation syntax with C-style semantics.

### Syntax Examples

#### Variables and Types
```ura
main():
    a i32 = 10
    name char[] = "Hello"
    flag bool = True
    c char = 'x'
```

#### Functions
```ura
fn add(a i32, b i32) i32:
    return a + b

main():
    result i32 = add(5, 3)
    return result
```

#### Control Flow
```ura
main():
    a i32 = 5
    if a < 10:
        return 1
    elif a < 20:
        return 2
    else:
        return 3
```

#### While Loops
```ura
main():
    i i32 = 0
    while i < 10:
        i += 1
    return i
```

#### For Loops
```ura
main():
    for i in 0..10 by 3:     // range, stepping by 3
        output(i)

    nums i32[] = [1, 2, 3]
    for x in nums:           // each element, by value
        output(x)

    for ref x in nums:       // aliases each element, writes stick
        x += 1
```

#### Structs
```ura
struct User:
    name char[]
    age i32
    active bool

main():
    user User
    user.age = 25
```

#### References
```ura
main():
    a i32 = 10
    b ref i32 = a    // b is a reference to a
    b = 20           // modifies a through the reference
    return a         // returns 20
```

#### C Interop
```ura
proto fn puts(str char[]) i32
proto fn malloc(size i32) pointer

main():
    puts("Hello, World!")
    return 0
```

## Supported Language Features

### Data Types
- `i8`, `i16`, `i32`, `i64` - Signed integers
- `u8`, `u16`, `u32`, `u64` - Unsigned integers
- `f32`, `f64` - Floating point
- `char` - A byte that prints as a character and holds `'x'` literals
- `char[]` - The string type; `chars` no longer exists
- `bool` - Boolean type (`True`, `False`)
- `void` - No return value
- `pointer` - Generic pointer type
- `array`, `List` - Aggregate types

A trailing `?` marks a type nullable, as in `char[]?`.

### Keywords

Each group below is a distinct colour in the grammar, so unrelated words never
share one.

| Group | Words | Scope |
|---|---|---|
| Conditional | `if` `elif` `else` `match` `case` `default` | `keyword.control.conditional` |
| Loop | `while` `loop` `for` `in` `by` `break` `continue` | `keyword.control.loop` |
| Return | `return` `ret` | `keyword.control.flow.return` |
| Exception | `try` `catch` `throw` | `keyword.control.exception` |
| Allocation | `new` `clean` | `keyword.operator.new` |
| Word operators | `and` `or` `not` `is` | `keyword.operator.logical` |
| Cast | `as` | `keyword.operator.cast` |
| Receiver | `self` | `variable.language.self` |
| Declaration | `fn` `struct` `enum` `mod` `operator` | `keyword.declaration` |
| Modifier | `pub` `proto` `ref` | `storage.modifier` |
| Import | `use` `link` | `keyword.control.import` |
| Types | `i8` `i16` `i32` `i64` `u8` `u16` `u32` `u64` `f32` `f64` `bool` `char` `void` `pointer` `array` `List` | `storage.type` |
| Builtins | `output` `errput` `typeof` `sizeof` | `support.function.builtin` |
| Directive | `@if` `@elif` `@else` `@no-warn` | `keyword.control.directive` |
| Literals | `True` `False` `null` | `constant.language` |

`operator drop`, `operator +`, `operator +=` and friends get
`keyword.other.special-method` on the operator itself.

### Operators
- **Arithmetic**: `+`, `-`, `*`, `/`, `%`
- **Comparison**: `==`, `!=`, `<`, `>`, `<=`, `>=`
- **Logical**: `&&`, `||`, `!` (and the words `and`, `or`, `not`, `is`)
- **Bitwise**: `&`, `|`, `^`, `~`, `<<`, `>>`
- **Assignment**: `=`, `+=`, `-=`, `*=`, `/=`, `%=`
- **Compound bitwise**: `&=`, `|=`, `^=`, `<<=`, `>>=`

### Built-in Functions
- `output()` - prints any value, including a whole struct
- `errput()` - the same, in red on stderr
- `typeof()`, `sizeof()` - compile-time type queries

### Comments
```ura
// Single line comment

/*
   Multi-line
   comment
*/
```

## Editor Configuration

The extension automatically configures the following settings for `.ura` files:

- **Tab Size**: 4 spaces
- **Insert Spaces**: Enabled
- **Auto Indent**: Advanced
- **Trim Auto Whitespace**: Enabled

You can override these in your VSCode settings if needed.

## Syntax Highlighting

The extension provides highlighting for:

- Keywords and control flow statements
- Data types and type declarations
- Function definitions and calls
- Struct definitions
- String literals with escape sequences
- Printf-style format specifiers in strings
- Character literals
- Numeric literals (integers and floats)
- Comments (line and block)
- Operators
- Language constants (`True`, `False`, `null`)
- Built-in functions

## Development

### Building from Source

Prerequisites:
- Node.js and npm
- `@vscode/vsce` package (installed automatically via npm)

Build and install:
```bash
make install
```

Other targets: `make build` (compile only), `make package` (create the
`.vsix`), `make clean`.

### Project Structure
```
.
├── package.json                 # Extension manifest
├── language-configuration.json  # Language configuration
├── syntaxes/
│   └── ura.tmLanguage.json     # TextMate grammar
├── icons/
│   ├── icon.png                # Extension icon
│   ├── icon.svg                # Extension icon (SVG)
│   └── file.json               # File icon theme
├── Makefile                    # Build and install targets
└── README.md                   # This file
```

### Uninstalling

To remove the extension:
```bash
rm -rf ~/.vscode/extensions/mohamedhrima.ura-lang-*
```

Then restart VSCode.

## About Ura Language

Ura is a work-in-progress compiled programming language that compiles to LLVM IR. The compiler is written in C and uses LLVM for code generation and optimization.

**Key Features:**
- Statically typed
- Python-like indentation syntax
- Direct compilation to native code via LLVM
- C library interoperability
- References and pointers
- Module system

For more information about the Ura language:
- [Ura Compiler Repository](https://github.com/mohammedhrima/ura-lang)
- [Language Documentation](https://github.com/mohammedhrima/ura-lang#readme)

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

MIT License - see LICENSE file for details

## Author

**Hrima Mohammed**
- GitHub: [@mohamedhrima](https://github.com/mohammedhrima)

## Changelog

### 0.0.1 (Initial Release)
- Syntax highlighting for all Ura language constructs
- Smart indentation with Python-like block structure
- Auto-closing pairs for brackets, quotes, and parentheses
- Comment toggling support
- Custom file icons
- Editor configuration defaults

## Acknowledgments

- Inspired by Python and C language extensions
- Built with VSCode Extension API
- TextMate grammar for syntax highlighting
