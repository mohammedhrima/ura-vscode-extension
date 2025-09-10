#!/bin/bash

# Variables
EXT_NAME="pandu"
VERSION="0.0.1"
VSIX_FILE="${EXT_NAME}-${VERSION}.vsix"
EXTENSIONS_DIR="$HOME/.vscode/extensions"

echo "=== Step 1: Ensure vsce is installed globally ==="
if ! command -v vsce &> /dev/null; then
    echo "vsce not found. Installing globally..."
    npm install -g vsce
else
    echo "vsce is already installed."
fi

echo "=== Step 2: Package the extension ==="
vsce package

if [ ! -f "$VSIX_FILE" ]; then
    echo "Error: VSIX file not found!"
    exit 1
fi

echo "=== Step 3: Remove previous local install ==="
if [ -d "$EXTENSIONS_DIR/${EXT_NAME}-${VERSION}" ]; then
    echo "Removing old extension..."
    rm -rf "$EXTENSIONS_DIR/${EXT_NAME}-${VERSION}"
fi

echo "=== Step 4: Extract VSIX to extensions folder ==="
mkdir -p "$EXTENSIONS_DIR/${EXT_NAME}-${VERSION}"
unzip -q "$VSIX_FILE" -d "$EXTENSIONS_DIR/${EXT_NAME}-${VERSION}"

# Move contents from 'extension/' up one level if exists
if [ -d "$EXTENSIONS_DIR/${EXT_NAME}-${VERSION}/extension" ]; then
    mv "$EXTENSIONS_DIR/${EXT_NAME}-${VERSION}/extension/"* "$EXTENSIONS_DIR/${EXT_NAME}-${VERSION}/"
    rmdir "$EXTENSIONS_DIR/${EXT_NAME}-${VERSION}/extension"
fi

echo "=== Step 5: Done! Reload VSCode to see your extension ==="
echo "You can now open a .pn file to test syntax highlighting and icon."

