# Zip a folder into backups/, named by date, and keep only the newest three.
import zipfile
from datetime import date, timedelta
from pathlib import Path

SOURCE = Path("documents")
BACKUPS = Path("backups")
KEEP = 3


def make_backup(day):
    BACKUPS.mkdir(exist_ok=True)
    target = BACKUPS / f"documents-{day.isoformat()}.zip"
    with zipfile.ZipFile(target, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        for path in sorted(SOURCE.rglob("*")):
            if path.is_file():
                zf.write(path, path.relative_to(SOURCE.parent))
    return target


def remove_old_backups():
    backups = sorted(BACKUPS.glob("documents-*.zip"))   # ISO dates sort by time
    for old in backups[:-KEEP]:
        old.unlink()
        print("  removed", old.name)


# Pretend the script ran on five days in a row (normally: day = date.today())
start = date(2026, 10, 11)
for n in range(5):
    target = make_backup(start + timedelta(days=n))
    print("Created", target.name)
    remove_old_backups()

print("Kept:", [p.name for p in sorted(BACKUPS.iterdir())])
with zipfile.ZipFile(target) as zf:
    print(f"{target.name} contains {len(zf.namelist())} files:")
    for name in zf.namelist():
        print("  ", name)
    print("Archive test:", zf.testzip() or "all files OK")
