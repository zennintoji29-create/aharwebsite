import os
import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Extract CSS
style_match = re.search(r'<style>(.*?)</style>', html, re.DOTALL)
if style_match:
    css = style_match.group(1).strip()
    os.makedirs('src/styles', exist_ok=True)
    with open('src/styles/main.css', 'w', encoding='utf-8') as f:
        f.write(css)

# Extract JS
script_match = re.search(r'<script>(.*?)</script>', html, re.DOTALL)
if script_match:
    js = script_match.group(1).strip()
    
    # We will just write all js into src/js/main.js for now to make sure it works,
    # or split it based on comments.
    
    # The JS has comments like: // 1. UTILS, // 2. CUSTOM CURSOR, etc.
    cursor_match = re.search(r'(// 2\. CUSTOM CURSOR.*?)// 3\.', js, re.DOTALL)
    three_match = re.search(r'(// 3\. THREE\.JS HERO BACKGROUND.*?)// 4\.', js, re.DOTALL)
    ui_match = re.search(r'(// 4\. SCROLL & NAVIGATION.*)', js, re.DOTALL)
    
    utils_match = re.search(r'(// 1\. UTILS.*?)// 2\.', js, re.DOTALL)

    os.makedirs('src/js', exist_ok=True)
    
    with open('src/js/utils.js', 'w', encoding='utf-8') as f:
        f.write("export " + utils_match.group(1).strip() + "\n")
        
    with open('src/js/cursor.js', 'w', encoding='utf-8') as f:
        f.write(cursor_match.group(1).strip() + "\n")

    with open('src/js/three-scene.js', 'w', encoding='utf-8') as f:
        # We need to import * as THREE from 'three'
        f.write("import * as THREE from 'three';\n\n")
        f.write(three_match.group(1).strip() + "\n")

    with open('src/js/ui.js', 'w', encoding='utf-8') as f:
        # ui needs throttle from utils
        f.write("import { throttle } from './utils.js';\n\n")
        # filterMenu and handleReserve are called from HTML inline handlers (onclick, onsubmit)
        # So we need to attach them to window
        ui_code = ui_match.group(1).strip()
        ui_code = ui_code.replace("function filterMenu", "window.filterMenu = function")
        ui_code = ui_code.replace("function handleReserve", "window.handleReserve = function")
        f.write(ui_code + "\n")

    with open('src/js/main.js', 'w', encoding='utf-8') as f:
        f.write("import '../styles/main.css';\n")
        f.write("import './cursor.js';\n")
        f.write("import './three-scene.js';\n")
        f.write("import './ui.js';\n")

# Update index.html
# Remove the <style> block
html = re.sub(r'<style>.*?</style>', '', html, flags=re.DOTALL)
# Remove the CDN link for three.js
html = re.sub(r'<script src="https://cdnjs.cloudflare.com/ajax/libs/three\.js/.*?</script>', '', html, flags=re.DOTALL)
# Replace the <script> block with a module import
html = re.sub(r'<script>.*?</script>', '<script type="module" src="/src/js/main.js"></script>', html, flags=re.DOTALL)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Split complete")
