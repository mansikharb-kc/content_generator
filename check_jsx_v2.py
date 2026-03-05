
import re

file_path = r"c:\Users\LT13\Desktop\CG\client\src\pages\IdeaDetail.jsx"
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove comments
content = re.sub(r'\{/\*.*?\*/\}', '', content, flags=re.DOTALL)
content = re.sub(r'//.*', '', content)

# Find all tags
# This regex finds <tag, </tag, and recognizes />
matches = re.finditer(r'<(/?)([a-zA-Z0-9]+)|(/?>)', content)

stack = []
tags_to_track = ['div', 'section', 'header', 'button']

for match in re.finditer(r'<(/?)(div|section|header|button)(?![a-zA-Z0-9])|/>', content):
    m = match.group(0)
    line_num = content[:match.start()].count('\n') + 1
    
    if m == '/>':
        if stack:
            # Check if recently added tag was self-closing candidates
            # But in JSX any tag can be self-closing <div />
            # So if we hit />, we should pop the last tag if it was marked as "pending"
            # However, my regex above matches <div or </div.
            # If it's <div... />, then it's a bit tricky.
            pass
        continue
        
    tag = match.group(2)
    is_closing = match.group(1) == '/'
    
    if is_closing:
        if not stack:
            print(f"ERROR: Extra closing tag </{tag}> at line {line_num}")
        else:
            top_tag, top_line = stack.pop()
            if top_tag != tag:
                print(f"ERROR: Mismatched tag </{tag}> at line {line_num}, expected closing for <{top_tag}> from line {top_line}")
    else:
        # Check if this specific tag instance is self-closing
        # Look ahead for /> before next <
        rest = content[match.end():]
        next_open = rest.find('<')
        next_self_close = rest.find('/>')
        
        if next_self_close != -1 and (next_open == -1 or next_self_close < next_open):
            # print(f"DEBUG: Self-closing <{tag}> at line {line_num}")
            continue
            
        stack.append((tag, line_num))

for tag, line_num in stack:
    print(f"ERROR: Unclosed <{tag}> at line {line_num}")
