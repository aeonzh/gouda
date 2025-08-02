#!/bin/bash

# Script to copy rules/ directory to .kilocode/rules/
# Creates the directory structure if it doesn't exist and replaces existing files

# Define source and destination directories
SOURCE_DIR="rules"
DEST_DIR=".kilocode/rules"

# Create destination directory and any child directories if they don't exist
mkdir -p "$DEST_DIR"

echo "Copying rules from $SOURCE_DIR to $DEST_DIR..."

# Copy all files and directories from source to destination
# The -r flag copies directories recursively
# The -f flag forces overwrite of existing files
# The -T flag treats dest as a normal file when dest is a symlink to a dir
cp -rfT "$SOURCE_DIR/" "$DEST_DIR/"

echo "Copy completed successfully!"

# Optional: Show what was copied
echo "Contents of $DEST_DIR:"
ls -la "$DEST_DIR"