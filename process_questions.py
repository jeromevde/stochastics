#!/usr/bin/env python3
"""
Script to add practical use cases to question files that are missing them.
"""

import os
import re
import sys

def has_practical_use_case(content):
    """Check if file already has a Practical Use Case section."""
    return '<strong>Practical Use Case:</strong>' in content

def find_answer_end(content):
    """Find where to insert the practical use case (after Answer section)."""
    # Look for the end of the Answer section (before </div>)
    match = re.search(r'(<strong>Answer:</strong>.*?)\n(\s*)</div>', content, re.DOTALL)
    if match:
        return match.start(2), match.group(2)  # Return position and indentation
    return None, None

def add_practical_use_case(filepath, use_case_text):
    """Add practical use case to a question file."""
    with open(filepath, 'r') as f:
        content = f.read()

    if has_practical_use_case(content):
        print(f"  ✓ {os.path.basename(filepath)} already has practical use case")
        return False

    pos, indent = find_answer_end(content)
    if pos is None:
        print(f"  ✗ {os.path.basename(filepath)}: Could not find Answer section")
        return False

    # Insert the practical use case
    new_content = (
        content[:pos] +
        f"\n{indent}<strong>Practical Use Case:</strong>\n{indent}{use_case_text}\n{indent}" +
        content[pos:]
    )

    with open(filepath, 'w') as f:
        f.write(new_content)

    print(f"  ✓ {os.path.basename(filepath)} updated")
    return True

def list_files_needing_updates(directory):
    """List all question files that need practical use cases."""
    files_needed = []
    for filename in sorted(os.listdir(directory)):
        if filename.endswith('.html') and filename[0].isdigit():
            filepath = os.path.join(directory, filename)
            with open(filepath, 'r') as f:
                content = f.read()
            if not has_practical_use_case(content):
                files_needed.append(filename)
    return files_needed

if __name__ == '__main__':
    questions_dir = '/home/runner/work/stochastics/stochastics/questions'
    files = list_files_needing_updates(questions_dir)
    print(f"Files needing practical use cases: {len(files)}")
    for f in files:
        print(f"  - {f}")
