
import re

def validate_jsx(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Simple comment removal
    content = re.sub(r'\{/\*.*?\*/\}', '', content, flags=re.DOTALL)
    content = re.sub(r'//.*', '', content)

    # Simplified tag parser
    tags = re.findall(r'<(/?)([a-zA-Z0-9.]+)|(/?>)', content)
    
    # We want to find <Tag and </Tag and />
    stack = []
    
    # Better regex: capture <Tag...>, </Tag>, and />
    # We avoid matching things in strings if possible, but let's keep it simple first
    for match in re.finditer(r'<(/?)([a-zA-Z0-9.]+)|(/?>)', content):
        line = content[:match.start()].count('\n') + 1
        
        if match.group(3) == '/>':
            if stack:
                stack.pop() # Assume the last opened tag was self-closing
            continue
            
        is_closing = match.group(1) == '/'
        tag_name = match.group(2)
        
        if not tag_name: continue
        
        # We only track div, section, header, button, main
        if tag_name.lower() not in ['div', 'section', 'header', 'button', 'main', 'p', 'span', 'form']:
            continue

        if is_closing:
            if not stack:
                print(f"[{file_path}] EXTRA CLOSE </{tag_name}> at line {line}")
            else:
                top_tag, top_line = stack.pop()
                if top_tag != tag_name:
                    print(f"[{file_path}] MISMATCH </{tag_name}> at line {line} (expected </{top_tag}> from line {top_line})")
        else:
            # Check if this tag is a self-closing one like <div />
            # Find the index of the next >
            next_gt = content.find('>', match.end())
            if next_gt != -1 and content[next_gt-1] == '/':
                # It's self-closing like <div />
                continue
            stack.append((tag_name, line))
            
    for tag_name, line in stack:
        print(f"[{file_path}] UNCLOSED <{tag_name}> at line {line}")

validate_jsx(r"c:\Users\LT13\Desktop\CG\client\src\pages\Dashboard.jsx")
validate_jsx(r"c:\Users\LT13\Desktop\CG\client\src\pages\IdeaDetail.jsx")
validate_jsx(r"c:\Users\LT13\Desktop\CG\client\src\pages\Login.jsx")
validate_jsx(r"c:\Users\LT13\Desktop\CG\client\src\App.jsx")
