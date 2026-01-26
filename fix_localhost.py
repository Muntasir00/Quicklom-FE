#!/usr/bin/env python3
"""
Fix all localhost references in frontend to use environment variables
"""
import os
import re

def fix_file(filepath):
    """Replace hardcoded localhost with environment variable"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content

        # Pattern 1: const API_BASE_URL = "http://localhost:8000";
        content = re.sub(
            r'const API_BASE_URL = "http://localhost:8000";',
            r"const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';",
            content
        )

        # Pattern 2: const API_BASE_URL = 'http://localhost:8000';
        content = re.sub(
            r"const API_BASE_URL = 'http://localhost:8000';",
            r"const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';",
            content
        )

        # Only write if changed
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False

    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return False

def main():
    """Find and fix all JS/JSX files"""
    src_dir = 'src'
    fixed_count = 0

    for root, dirs, files in os.walk(src_dir):
        # Skip node_modules and dist
        dirs[:] = [d for d in dirs if d not in ['node_modules', 'dist', '.git']]

        for file in files:
            if file.endswith(('.js', '.jsx')):
                filepath = os.path.join(root, file)
                if fix_file(filepath):
                    fixed_count += 1
                    print(f"✓ Fixed: {filepath}")

    print(f"\n✅ Fixed {fixed_count} files")

if __name__ == '__main__':
    main()
