# Chapter 17: Virtual Environments, Packages and Project Layout

Small scripts live happily in a single file. Real projects grow into folders of modules, depend on packages written by other people, and need to be installed on other computers. In this chapter you'll learn how Python projects are organized: **virtual environments** to keep each project's packages separate, **pip** to install packages, and **pyproject.toml** to turn your own code into a package that installs with one command and gives you a real command-line tool. Pocket Library becomes an installable app with its own `pocket` command.

## Why Virtual Environments?

Suppose one of your projects needs version 2 of a package and another needs version 3. If both are installed into the same Python, one project breaks. A **virtual environment** solves this: it's a folder containing its own copy of the `python` command and its own set of installed packages. Each project gets one, usually called `.venv`, inside the project folder.

You created one in Chapter 15. Here are the steps again, with the commands to leave and remove it:

| Task | Windows | macOS and Linux |
| --- | --- | --- |
| Create | `python -m venv .venv` | `python3 -m venv .venv` |
| Activate | `.venv\Scripts\activate` | `source .venv/bin/activate` |
| Leave | `deactivate` | `deactivate` |
| Remove | delete the `.venv` folder | delete the `.venv` folder |

While it's active, your prompt starts with `(.venv)`, and `python` and `pip` refer to the environment's copies. Packages you install go into `.venv`, and nowhere else. If an environment gets into a mess, delete the folder and create a new one; it holds nothing you can't reinstall.

> **Tip:** Never put your own files inside `.venv`, and don't copy it to other computers or add it to version control. It's specific to one computer. What you share is the list of packages, as you'll see below.

Many Linux systems and Homebrew on macOS refuse to install packages into the system's Python and print an error mentioning an *externally managed environment*. That's deliberate protection. The answer is always the same: use a virtual environment.

## Installing Packages with pip

**pip** installs packages from the **Python Package Index** (PyPI) at pypi.org, which holds hundreds of thousands of packages. Run it as `python -m pip`, which makes sure you use the pip that belongs to the active Python:

```
$ python -m pip install pandas
$ python -m pip install "pandas==3.0.6"
$ python -m pip list
$ python -m pip install --upgrade pandas
$ python -m pip uninstall pandas
```

The first command installs the newest version, along with any packages pandas itself needs. The second installs an exact version. `list` shows what's installed, `--upgrade` moves to the newest version, and `uninstall` removes it.

To record what a project needs, list the packages in a `requirements.txt` file, one per line, so that anyone can recreate the environment with `python -m pip install -r requirements.txt`. Here's the one for this book:

```
@include requirements.txt
```

Pinning exact versions with `==` makes an environment reproducible: everyone gets the same versions, the ones that were tested. `python -m pip freeze` prints every installed package with its exact version, in this format.

> **Warning:** Anyone can publish a package on PyPI, and installing a package runs code on your computer. Check the spelling of a package name before installing it, because attackers publish packages with names one letter away from popular ones. Prefer well-known packages with active maintenance, and look at a package's page on pypi.org and its project site before installing something unfamiliar.

## A Faster Alternative: uv

**uv** is a popular newer tool that creates environments, installs packages and even installs Python versions, much faster than pip. Its commands mirror the ones above: `uv venv` creates `.venv`, and `uv pip install pandas` installs into it. The book's examples were tested in environments made with uv, and they work the same with venv and pip. Use whichever you prefer; this book shows the standard tools, because they come with every Python.

## Laying Out a Project

Here's Pocket Library as a proper project:

```
pocket-library/
    pyproject.toml
    README.md
    src/
        pocket_library/
            __init__.py
            __main__.py
            books.py
            cli.py
    tests/
        test_books.py
```

- **`src/pocket_library/`** is the **package**: a folder of modules that's imported as a unit, as in `from pocket_library.books import Book`. Putting it inside `src/` makes sure your tests run against the installed package, not against whatever files happen to be lying around.
- **`__init__.py`** marks the folder as a package and runs when it's first imported. Here, it just holds the version.
- **`__main__.py`** runs when you type `python -m pocket_library`.
- **`tests/`** holds the tests, outside the package.
- **`pyproject.toml`** describes the project: its name, version, requirements and commands.

The package code is the dataclass version of Pocket Library from Chapter 13, with a command-line interface built with `argparse` as in Chapter 11:

```
@include code/ch17/pocket-library/src/pocket_library/__init__.py
```

```
@include code/ch17/pocket-library/src/pocket_library/books.py
```

```
@include code/ch17/pocket-library/src/pocket_library/cli.py
```

```
@include code/ch17/pocket-library/src/pocket_library/__main__.py
```

`from .books import Book, Library` is a **relative import**: the dot means "from this package". `add_subparsers` gives the tool subcommands, like `pocket add` and `pocket list`, each with its own arguments. `main` takes an optional list of arguments, which lets the tests call it directly, and returns an **exit code**: 0 for success and 1 for an error, the convention every command-line tool follows. Error messages go to `sys.stderr`, the error stream, so they aren't mixed into output that another program might read.

## pyproject.toml

The project file is written in **TOML**, a simple settings format:

```
@include code/ch17/pocket-library/pyproject.toml
```

- **`[build-system]`** says which tool builds the package: here, **setuptools**, the most widely used.
- **`[project]`** gives the name people install it by, its version, a one-line description, the Python versions it supports, and its license.
- **`[project.scripts]`** creates a command. `pocket = "pocket_library.cli:main"` means: make a command called `pocket` that calls `main` in `pocket_library.cli`. When the package is installed, pip creates a small program called `pocket` in the environment.
- **`[project.optional-dependencies]`** lists extras. `test = ["pytest"]` means `pip install ".[test]"` also installs pytest. Packages that the code itself needs would go in a `dependencies` list in `[project]`; Pocket Library needs none.

## Installing and Running Your Package

Here are the commands, run in a fresh virtual environment from inside the `pocket-library` folder, with the environment activated:

```
@include code/ch17/install_transcript.out
```

`pip install -e .` installs the project in **editable** mode: the `-e` makes the installed package point at your source files, so changes take effect without reinstalling. `.[test]` installs it with its test extra. After that, `pocket` is a command like any other. It saves its books in `library.json` in the current folder.

This transcript was produced by a script that ran these commands in a fresh environment on Python 3.12, 3.13, 3.14 and 3.15, and got exactly the same output each time.

Here are the tests, which use the `tmp_path` fixture from Chapter 15 and another built-in fixture, `capsys`, which captures what a function prints:

```
@include code/ch17/pocket-library/tests/test_books.py
```

To share your package, `python -m build` (after `python -m pip install build`) creates a **wheel**, a single `.whl` file that anyone can install with pip. Publishing to PyPI is beyond this book; the Python Packaging User Guide at packaging.python.org explains it step by step.

## Try It

1. Create a new virtual environment, install the package from the book's code repository (`code/ch17/pocket-library`) with `python -m pip install -e ".[test]"`, and run the tests.
2. Run `pocket --help` and `pocket add --help`. Where does the help text come from?
3. Run `python -m pocket_library list`. Which file makes that work?

## Exercises

1. **Statistics.** Add a `pocket stats` command that prints how many books there are, how many are read and still to read, and the oldest book. Put the calculation in a function that returns lines of text, so that it's easy to test.

## Key Takeaways

- Give every project its own virtual environment: `python -m venv .venv`, then activate it. Never install into the system Python.
- Install packages with `python -m pip install`, and record them in `requirements.txt`, pinned with `==` for reproducibility. Check package names carefully.
- A package is a folder of modules with `__init__.py`; put it in `src/`, with tests in `tests/` and a `pyproject.toml` at the top.
- `[project.scripts]` in `pyproject.toml` turns a function into a command. `pip install -e .` installs a project for development.
