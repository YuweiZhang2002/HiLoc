"""Package the public site with content-addressed CSS and JavaScript."""

from hashlib import sha256
from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT / "_site"


def build():
    OUTPUT.mkdir(exist_ok=True)
    assets = OUTPUT / "assets"
    assets.mkdir(exist_ok=True)
    page = (ROOT / "index.html").read_text(encoding="utf-8")
    for name, attribute in (("style.css", "href"), ("script.js", "src")):
        content = (ROOT / name).read_bytes()
        source = Path(name)
        filename = f"{source.stem}.{sha256(content).hexdigest()[:16]}{source.suffix}"
        (assets / filename).write_bytes(content)
        original = f'{attribute}="{name}"'
        assert page.count(original) == 1, f"Expected one reference to {name}"
        page = page.replace(original, f'{attribute}="assets/{filename}"')
    for source in (ROOT / "assets").iterdir():
        if source.suffix in {".webp", ".svg"}:
            shutil.copy2(source, assets / source.name)
    (OUTPUT / "index.html").write_text(page, encoding="utf-8")
    (OUTPUT / ".nojekyll").touch()
    print("Built _site with content-addressed CSS and JavaScript.")


if __name__ == "__main__":
    build()
