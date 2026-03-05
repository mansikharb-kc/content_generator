
import re

def check_jsx_balance(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Remove comments
    content = re.sub(r'\{/\*.*?\*/\}', '', content, flags=re.DOTALL)
    content = re.sub(r'//.*', '', content)
    
    tags = re.findall(r'<(/?)([a-zA-Z0-9]+)', content)
    stack = []
    
    self_closing = ['img', 'input', 'br', 'hr', 'ArrowLeft', 'Lock', 'Unlock', 'RefreshCw', 'Share2', 'Sparkles', 'Edit2', 'Check', 'X', 'Instagram', 'Facebook', 'Pin', 'Youtube', 'Linkedin', 'MessageCircle', 'Copy', 'CheckCheck', 'LockOpen', 'Zap', 'Database', 'Eye', 'Trash2', 'LogOut', 'Download', 'FileSpreadsheet', 'User', 'FileText', 'ImageIcon', 'Menu', 'Shield']

    for i, (is_closing, tag_name) in enumerate(tags):
        # We also need to handle self-closing tags like <img />
        # But grep findall above doesn't distinguish <div /> from <div>
        # Let's refine the regex to find the end of the tag.
        pass

    # Simplified check for just div and section
    divs = 0
    sections = 0
    headers = 0
    buttons = 0
    
    # We'll use a more robust way: find all <tag and all </tag
    open_divs = len(re.findall(r'<div(?![a-zA-Z0-9])', content))
    close_divs = len(re.findall(r'</div>', content))
    
    open_sections = len(re.findall(r'<section(?![a-zA-Z0-9])', content))
    close_sections = len(re.findall(r'</section>', content))
    
    print(f"Divs: Open={open_divs}, Close={close_divs}")
    print(f"Sections: Open={open_sections}, Close={close_sections}")

check_jsx_balance(r"c:\Users\LT13\Desktop\CG\client\src\pages\IdeaDetail.jsx")
