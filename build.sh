#!/bin/bash

# Variables
EXT_NAME="ura-lang"
VERSION="0.0.1"
VSIX_FILE="${EXT_NAME}-${VERSION}.vsix"
EXTENSIONS_DIR="$HOME/.vscode/extensions"
TARGET_DIR="$EXTENSIONS_DIR/mohamedhrima.${EXT_NAME}-${VERSION}"

echo "=== Building Ura VSCode Extension ==="

# Step 1: Check dependencies
echo "Step 1: Checking dependencies..."
if ! command -v vsce &> /dev/null; then
    echo "Installing vsce globally..."
    npm install -g @vscode/vsce
else
    echo "✓ vsce is installed"
fi

# Step 2: Install npm dependencies and compile TypeScript
echo "Step 2: Installing dependencies and compiling TypeScript..."
npm install
npx tsc --noEmit false
if [ $? -ne 0 ]; then
    echo "❌ TypeScript compilation failed!"
    exit 1
fi
echo "✓ TypeScript compiled to out/"

# Step 3: Clean old builds
echo "Step 3: Cleaning old builds..."
rm -f *.vsix

# Step 4: Package the extension
echo "Step 4: Packaging extension..."
vsce package

if [ ! -f "$VSIX_FILE" ]; then
    echo "❌ Error: VSIX file not created!"
    exit 1
fi
echo "✓ VSIX created: $VSIX_FILE"

# Step 5: Remove old installation
echo "Step 5: Removing old installation..."
rm -rf "$EXTENSIONS_DIR"/mohamedhrima.${EXT_NAME}-*
rm -rf "$EXTENSIONS_DIR"/${EXT_NAME}-*
echo "✓ Old versions removed"

# Step 6: Install extension
echo "Step 6: Installing extension..."
mkdir -p "$TARGET_DIR"
unzip -q "$VSIX_FILE" -d "$TARGET_DIR"

# Move files if they're in 'extension' subdirectory
if [ -d "$TARGET_DIR/extension" ]; then
    mv "$TARGET_DIR/extension/"* "$TARGET_DIR/" 2>/dev/null
    rmdir "$TARGET_DIR/extension" 2>/dev/null
fi

echo "✓ Extension installed to: $TARGET_DIR"

# Step 7: Verify installation
echo ""
echo "=== Installation Complete ==="
echo "Extension location: $TARGET_DIR"
echo ""
echo "Next steps:"
echo "1. Restart VSCode completely (Cmd+Q then reopen)"
echo "2. Open a .ura file"
echo "3. Check language mode in bottom-right corner"
echo "4. If needed, click language mode and select 'Ura'"
echo ""
echo "To uninstall: rm -rf \"$TARGET_DIR\""