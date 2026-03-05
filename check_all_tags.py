
import re

def check_tags(name, file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove comments
    content = re.sub(r'\{/\*.*?\*/\}', '', content, flags=re.DOTALL)
    content = re.sub(r'//.*', '', content)
    
    print(f"--- {name} ---")
    div_opens = len(re.findall(r'<div(?![a-zA-Z0-9])', content))
    div_closes = len(re.findall(r'</div>', content))
    print(f"  Divs: {div_opens} vs {div_closes}")
    
    sec_opens = len(re.findall(r'<section(?![a-zA-Z0-9])', content))
    sec_closes = len(re.findall(r'</section>', content))
    print(f"  Sections: {sec_opens} vs {sec_closes}")

    butt_opens = len(re.findall(r'<button(?![a-zA-Z0-9])', content))
    butt_closes = len(re.findall(r'</button>', content))
    print(f"  Buttons: {butt_opens} vs {butt_closes}")

check_tags("IdeaDetail", r"c:\Users\LT13\Desktop\CG\client\src\pages\IdeaDetail.jsx")
check_tags("App", r"c:\Users\LT13\Desktop\CG\client\src\App.jsx")
check_tags("Login", r"c:\Users\LT13\Desktop\CG\client\src\pages\Login.jsx")
check_tags("Dashboard", r"c:\Users\LT13\Desktop\CG\client\src\pages\Dashboard.jsx")
