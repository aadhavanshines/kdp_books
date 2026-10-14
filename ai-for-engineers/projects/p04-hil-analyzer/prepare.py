"""Copy the inputs Claude Code may see into this folder: the logs, the
limits and the procedures. The answers in ../wlc200/labels stay outside.
Run it with:  python prepare.py
"""
import shutil
from pathlib import Path

HERE = Path(__file__).parent
WLC = HERE.parent / "wlc200"
shutil.copytree(WLC / "hil" / "2026-10-06", HERE / "data" / "2026-10-06", dirs_exist_ok=True)
shutil.copy(WLC / "hil" / "limits-v1.3.json", HERE / "data")
(HERE / "docs").mkdir(exist_ok=True)
for name in ("TP-AP-01-anti-pinch-test.md", "TP-TH-01-thermal-test.md", "GL-HIL-2-bench-guide.md"):
    shutil.copy(WLC / "knowledge" / name, HERE / "docs")
# The specification's definitions (end positions, pinch zone), added after a
# review found the analyzer guessing what "fully open" means
spec = (WLC / "spec" / "WLC-200-SRS-v1.3.md").read_text()
defs = spec.split("## 2. Definitions")[1].split("## 3.")[0]
(HERE / "docs" / "WLC-200-definitions.md").write_text(
    "# WLC-200 definitions (from ADS-WLC200-SRS v1.3, section 2)\n" + defs)
print("Copied logs, limits, procedures and definitions.")
