import os
import re

root = r"C:\Users\Admin\Desktop\PROTOTIPO"

for name in os.listdir(root):
    if not name.lower().endswith(".html"):
        continue

    path = os.path.join(root, name)
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        html = f.read()

    matches = re.findall(r"<style\b[^>]*>(.*?)</style>", html, flags=re.IGNORECASE | re.DOTALL)
    if not matches:
        continue

    css_name = os.path.splitext(name)[0] + ".css"
    css_path = os.path.join(root, css_name)
    css = "\n\n".join(part.strip() for part in matches if part.strip())

    with open(css_path, "w", encoding="utf-8") as f:
        f.write(css)

    new_html = re.sub(r"\s*<style\b[^>]*>.*?</style>\s*", "", html, flags=re.IGNORECASE | re.DOTALL)
    link = f'    <link rel="stylesheet" href="{css_name}">'

    if "</head>" in new_html.lower():
        new_html = new_html.replace("</head>", link + "\n</head>", 1)
    else:
        new_html += "\n" + link + "\n"

    with open(path, "w", encoding="utf-8") as f:
        f.write(new_html)

    print(f"{name} -> {css_name}")
