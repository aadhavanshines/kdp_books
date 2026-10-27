"""Skills: folders with a SKILL.md that teach Sparrow a task.

Only each skill's name and one-line description go into the prompt; the
full instructions are loaded when needed (progressive disclosure)."""

from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path

import yaml

NAME = re.compile(r"^[a-z0-9][a-z0-9-]{0,40}$")


@dataclass
class Skill:
    name: str
    description: str
    body: str
    folder: Path


def parse_skill(path: Path) -> Skill:
    text = path.read_text()
    if not text.startswith("---\n"):
        raise ValueError(f"{path}: SKILL.md must start with ---")
    _, header, body = text.split("---\n", 2)
    meta = yaml.safe_load(header) or {}
    name, description = meta.get("name"), meta.get("description")
    if not (isinstance(name, str) and NAME.match(name)):
        raise ValueError(f"{path}: bad or missing name")
    if not isinstance(description, str) or not description.strip():
        raise ValueError(f"{path}: missing description")
    return Skill(
        name, " ".join(description.split()), body.strip(), path.parent
    )


class SkillLibrary:
    def __init__(self, folder: Path):
        self.folder = folder

    def load(self) -> dict[str, Skill]:
        """Read every skill; skip (and report) broken ones."""
        skills, self.problems = {}, []
        for path in sorted(self.folder.glob("*/SKILL.md")):
            try:
                skill = parse_skill(path)
            except ValueError as error:
                self.problems.append(str(error))
                continue
            skills[skill.name] = skill
        return skills

    def index(self) -> str:
        skills = self.load()
        if not skills:
            return "(no skills installed)"
        return "\n".join(
            f"- {s.name}: {s.description}" for s in skills.values()
        )

    def read(self, name: str) -> str:
        skill = self.load().get(name)
        if skill is None:
            return (
                f"No skill called {name!r}. Available: "
                + ", ".join(self.load())
                + "."
            )
        return skill.body

    def write(self, name: str, description: str, body: str) -> Path:
        """Save a new skill (the caller decides whether that's allowed)."""
        if not NAME.match(name):
            raise ValueError("Skill names use a-z, 0-9 and hyphens only.")
        folder = self.folder / name
        folder.mkdir(parents=True, exist_ok=True)
        header = yaml.safe_dump(
            {"name": name, "description": " ".join(description.split())},
            sort_keys=False,
            width=1000,
        )
        path = folder / "SKILL.md"
        path.write_text(f"---\n{header}---\n{body.strip()}\n")
        parse_skill(path)  # refuse to leave a broken skill behind
        return path
