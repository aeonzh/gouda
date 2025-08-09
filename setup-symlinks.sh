#!/bin/bash

# Setup script to symlink files in rules/ to .kilocode/rules

set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Source and target directories
SOURCE_DIR="$SCRIPT_DIR/rules"
TARGET_DIR="$SCRIPT_DIR/.kilocode/rules"

# Check if source directory exists
if [ ! -d "$SOURCE_DIR" ]; then
    echo "Error: Source directory '$SOURCE_DIR' does not exist."
    exit 1
fi

# Create target directory if it doesn't exist
mkdir -p "$TARGET_DIR"

echo "Setting up symlinks from $SOURCE_DIR to $TARGET_DIR"

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

# Process each file in the source directory
for file in "$SOURCE_DIR"/*; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        target_path="$TARGET_DIR/$filename"
        create_symlink "$file" "$target_path"
    fi
done

echo "Setup complete!"
echo "Files in $SOURCE_DIR have been symlinked to $TARGET_DIR"