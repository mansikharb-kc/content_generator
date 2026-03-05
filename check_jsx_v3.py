
import re

file_path = r"c:\Users\LT13\Desktop\CG\client\src\pages\Login.jsx"
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove comments
content = re.sub(r'\{/\*.*?\*/\}', '', content, flags=re.DOTALL)
content = re.sub(r'//.*', '', content)

# Regex to find <tag, </tag, and />
# We want to capture the tag name and whether it's closing.
# Handling spaces in </div >
tag_regex = re.compile(r'<(/?)\s*([a-zA-Z0-9]+)\s*|(/?>)')

stack = []
# We only care about matching tags that are NOT self-closing in the standard sense (like <img>)
# but in JSX anything can be self-closing.
non_self_closing_html = ['div', 'section', 'header', 'footer', 'main', 'aside', 'article', 'button', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'form', 'label', 'nav']

# Better approach: parse tokens
tokens = []
# Find all < and </ and /> and >
pos = 0
while pos < len(content):
    match = re.search(r'</?\s*([a-zA-Z0-9]+)|/?>', content[pos:])
    if not match:
        break
    
    start = pos + match.start()
    end = pos + match.end()
    token_text = match.group(0)
    line_num = content[:start].count('\n') + 1
    
    if token_text.startswith('</'):
        tag_name = match.group(1).strip()
        tokens.append({'type': 'close', 'tag': tag_name, 'line': line_num})
    elif token_text.startswith('<'):
        tag_name = match.group(1).strip()
        # Find the end of this tag to see if it's self-closing
        tag_end_match = re.search(r'/?>', content[end-1:]) # search starting from the end of the tag name matches
        if tag_end_match:
            tag_end_text = tag_end_match.group(0)
            if tag_end_text == '/>':
                # Self-closing
                pass
            else:
                tokens.append({'type': 'open', 'tag': tag_name, 'line': line_num})
            pos = end + tag_end_match.end() - 1
            continue
    pos = end

for t in tokens:
    if t['type'] == 'open':
        stack.append(t)
    else:
        if not stack:
            print(f"ERROR: Extra closing tag </{t['tag']}> at line {t['line']}")
        else:
            top = stack.pop()
            if top['tag'] != t['tag']:
                print(f"ERROR: Mismatched tag </{t['tag']}> at line {t['line']}, expected closing for <{top['tag']}> from line {top['line']}")

for t in stack:
    print(f"ERROR: Unclosed <{t['tag']}> at line {t['line']}")
