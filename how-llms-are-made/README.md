# How Large Language Models Are Made

*The Complete Plain-English Story of AI, from Data and Chips to Chatbots, Reasoning, Images, Video and Agents*, by Aadhavan Muthurengan.

Twenty-seven chapters in seven parts, written for readers with no math or programming background: tokens and embeddings, training data, how networks learn, the Transformer, scaling laws, chips, data centers, energy and water, pretraining, post-training, reasoning models, benchmarks, safety, inference, small models and fine-tuning, long context and retrieval, agents, open and closed models, a tour of the open model families, the frontier labs, vision, image, video, speech and music models, and AI's effects on society. Appendices: timeline, glossary, model fact sheets, credits (who invented what), and model names and abbreviations decoded. Status as of October 2026.

## Folders

| Folder | Contents |
| --- | --- |
| `manuscript/` | The book in Markdown, one file per chapter; `images/` holds the generated diagrams. |
| `research/` | `facts.md`, the research log of checked facts and their sources; `demos/`, the toy BPE tokenizer run used in Chapter 3. |
| `build/` | The build pipeline: Markdown parser, PDF interior, EPUB, covers, diagrams (`diagrams.py` draws all 27). |
| `metadata/` | KDP listing details. |
| `dist/` | Upload-ready files: EPUB, eBook covers (dark and white), paperback interior PDF, paperback cover PDF. |

## Build

```
python3 build/build.py          # diagrams, EPUB, interior PDF and covers into dist/
python3 tools/white_covers.py   # (from the repo root) white-background eBook covers
```

## Checks run before release

- EPUBCheck 5.1.0: no errors or warnings.
- `build/check_pdf.py`: KDP margins, table of contents, no chapter starting on a left-hand page.
- codespell and LanguageTool (en-US) over the manuscript.
