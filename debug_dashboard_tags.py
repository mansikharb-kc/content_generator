
import re

def check_tags_with_lines(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove comments
    content = re.sub(r'\{/\*.*?\*/\}', '', content, flags=re.DOTALL)
    content = re.sub(r'//.*', '', content)
    
    # Find all <div> (including with classes) and </div>
    tokens = []
    for match in re.finditer(r'<div(?![a-zA-Z0-9])|</div>', content):
        line_num = content[:match.start()].count('\n') + 1
        tokens.append((match.group(0), line_num))
    
    stack = []
    for tag, line in tokens:
        if tag.startswith('<div'):
            # Check if it's self-closing <div />
            # Find the next >
            rest = content[content.find(tag, content.rfind('\n', 0, content.find(tag))):] # this is too complex, let's just look ahead a bit
            # Actually, my previous script check if it's self closing. Let's do it properly.
            pass
        
    # Let's just print them all
    for tag, line in tokens:
        print(f"{tag} at {line}")

check_tags_with_lines(r"c:\Users\LT13\Desktop\CG\client\src\pages\Dashboard.jsx")
