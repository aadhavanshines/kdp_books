# Appendix B: Troubleshooting Quick Reference

Use this table when a prompt isn't working. Find the symptom, then try the fixes in order.

| Symptom | Likely cause | Fixes to try |
| --- | --- | --- |
| Generic, bland output | Missing context | Add audience, purpose, specific facts, and an example of the voice you want |
| Too long | No length limit, or words like "comprehensive" | Specify bullets, sentences, or a word range; remove "detailed" |
| Too short or shallow | Unclear depth | Ask for specific sections, examples, and depth; use a reasoning mode |
| Invented facts | No source material, or pressure to answer | Provide sources, require quotes, allow "I don't know," use search |
| Ignores an instruction | Buried, vague, or conflicting instruction | Move it to its own heading; make it specific; explain why; remove conflicts |
| Wrong format | Format not specified precisely | Provide a template or schema and a full example |
| Inconsistent results | Ambiguity and randomness | Add examples, tighten format, lower temperature, test multiple runs |
| Wrong tone | Tone described vaguely | Use multiple adjectives, an analogy, and a sample paragraph |
| Copies examples too closely | Examples too similar | Vary examples; say they show style only |
| Too agreeable | Default helpful bias | Ask for critique; assign a critical role; ask for counterarguments |
| Refuses a legitimate request | Ambiguous framing | Explain your purpose and context; clarify scope |
| Forgets earlier instructions | Long conversation | Restate key points or start fresh with a summary; use persistent instructions |
| Math errors | In-text arithmetic | Use a code or data analysis tool; check calculations |
| Outdated information | Knowledge cutoff | Use search-enabled mode or paste current information |
| Unparsable JSON | No enforced schema | Use structured output features; show the schema; validate in code |
| Agent stops early or loops | Unclear goal or "done" criteria | Define success explicitly; ask for a plan; tell it to change approach after repeated failure |
| Agent misuses a tool | Poor tool description | Rewrite the description with when to use it, parameters, and examples |
| Image ignores details | Key details buried late in prompt | Put the most important elements first; simplify; iterate with edits |

## The Five-Question Diagnosis

When you're stuck, ask:

1. **What exactly is wrong?** Name the failure precisely.
2. **Did the model have the information it needed?**
3. **Could my prompt be read another way?**
4. **Do any of my instructions conflict?**
5. **Am I asking for too much at once?**

The answer to one of these questions almost always points to the fix.
