#!/bin/bash

# Setup script to symlink .md files from .agents/rules to .mdc files in .cursor/rules and .md files in .kilocode/rules
# Also symlink .agents/mcp.json to .cursor/ and .kilocode/

set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Source directories and files
SOURCE_RULES_DIR="$SCRIPT_DIR/.agents/rules"
SOURCE_MCP_FILE="$SCRIPT_DIR/.agents/mcp.json"

# Target directories
TARGET_CURSOR_RULES_DIR="$SCRIPT_DIR/.cursor/rules"
TARGET_KILOCODE_RULES_DIR="$SCRIPT_DIR/.kilocode/rules"
TARGET_ROOT_DIRS=("$SCRIPT_DIR/.cursor" "$SCRIPT_DIR/.kilocode")

# Check if source directories/files exist
if [ ! -d "$SOURCE_RULES_DIR" ]; then
    echo "Error: Source directory '$SOURCE_RULES_DIR' does not exist."
    exit 1
fi

if [ ! -f "$SOURCE_MCP_FILE" ]; then
    echo "Error: Source file '$SOURCE_MCP_FILE' does not exist."
    exit 1
fi

# Function to create symlink
create_symlink() {
    local source_file="$1"
    local target_file="$2"

    # Remove existing file or symlink if it exists
    if [ -e "$target_file" ] || [ -L "$target_file" ]; then
        echo "Removing existing: $target_file"
        rm -f "$target_file"
    fi

    # Create symlink
    echo "Creating symlink: $target_file -> $source_file"
    ln -s "$source_file" "$target_file"
}

# Process rules files for .cursor (md -> mdc)
echo "Setting up symlinks from $SOURCE_RULES_DIR to $TARGET_CURSOR_RULES_DIR"
mkdir -p "$TARGET_CURSOR_RULES_DIR"

for file in "$SOURCE_RULES_DIR"/*.md; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        # Change extension from .md to .mdc for cursor
        target_filename="${filename%.md}.mdc"
        target_path="$TARGET_CURSOR_RULES_DIR/$target_filename"
        create_symlink "$file" "$target_path"
    fi
done

# Process rules files for .kilocode (keep .md)
echo "Setting up symlinks from $SOURCE_RULES_DIR to $TARGET_KILOCODE_RULES_DIR"
mkdir -p "$TARGET_KILOCODE_RULES_DIR"

for file in "$SOURCE_RULES_DIR"/*.md; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        # Keep .md extension for kilocode
        target_path="$TARGET_KILOCODE_RULES_DIR/$filename"
        create_symlink "$file" "$target_path"
    fi
done

# Process MCP file
for TARGET_DIR in "${TARGET_ROOT_DIRS[@]}"; do
    echo "Setting up symlink from $SOURCE_MCP_FILE to $TARGET_DIR/"

    # Create symlink for mcp.json in the root target directory
    target_path="$TARGET_DIR/mcp.json"
    create_symlink "$SOURCE_MCP_FILE" "$target_path"
done

echo "Setup complete!"
echo ".md files from $SOURCE_RULES_DIR have been symlinked as .mdc files to .cursor/rules and as .md files to .kilocode/rules"
echo "MCP configuration has been symlinked to both .cursor/ and .kilocode/"