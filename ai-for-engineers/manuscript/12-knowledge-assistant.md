# Chapter 12: Project 8: Engineering Knowledge Assistant

Every engineering organisation learns the same lessons more than once. The rough-road reversal that cost a predecessor program 37 warranty claims gets rediscovered by a new team, because the lessons-learned report sits in a folder nobody searches. A knowledge assistant that answers "what did we learn last time?" in seconds is one of the most useful AI tools a team can have. It's also one of the most dangerous if it makes things up, because a confident wrong answer about a test procedure looks exactly like a right one. This chapter builds an assistant that answers only from the documents, quotes them, has every quote checked by code, and says plainly when the documents don't know.

## The Documents

The WLC-200 knowledge base is small on purpose, so you can read all of it: five lessons learned from the predecessor product and a sister product, the anti-pinch and thermal test procedures, and the guide for bench HIL-2. Here is the end of one lesson:

```
@include projects/wlc200/knowledge/LL-2023-05-hall-connector.md#L15-L23
```

All eight documents together are about 9,000 characters, a little over 2,000 tokens. They fit easily in one prompt, so this project doesn't need a search index. The end of the chapter explains what changes when the documents don't fit.

## The Assistant

The documents go into the system prompt, each wrapped in a tag with its name, after the rules:

```
@include projects/p08-knowledge/ask.py::system_prompt
```

The rules do four jobs. "Only the documents" excludes general knowledge, even correct general knowledge, because an answer that mixes the company's procedure with a textbook's is hard to trust. The quotes make every answer checkable. The `found` flag gives the assistant a respectable way to say "I don't know". The four-sentence limit keeps answers short enough to read and check.

The schema has three fields:

```
@include projects/p08-knowledge/ask.py::SCHEMA
```

## Every Quote Checked

Code checks every quote against the document it names, after normalising whitespace and Markdown bold marks. A quote that isn't in the document, a document that doesn't exist, or a "found" answer with no quotes is reported:

```
@include projects/p08-knowledge/ask.py::normalise,check_quotes
```

The check is strict on purpose. A quote with one word changed ("12 N/mm" instead of "10 N/mm") fails, and that is exactly the error that matters. The offline tests include it.

## Asking a Question

```
python ask.py "Why did WLC-100 windows reverse by themselves on rough roads?"
```

The answer, as saved:

```
@include projects/p08-knowledge/output/answers-sonnet-run1.json#L93-L107
```

The answer names the cause and the fix, and the two quotes let anyone confirm it in the source in seconds. Each question costs about one cent and takes about five seconds.

## Saying "the Documents Don't Say"

Three of the eighteen test questions can't be answered from the documents: the warranty cost of the rough-road reversals, the supplier of the Hall sensor, and the maximum pinch force allowed by ISO standards. The last one is a trap: a model's general knowledge has opinions about pinch-force standards, and the rules say not to use them. Here is how the assistant handled the supplier question:

```
@include projects/p08-knowledge/output/answers-sonnet-run1.json#L812-L816
```

It said what it didn't know, said what the documents do cover, and gave no quotes. For the ISO question, every run said that the documents don't mention any ISO standard, and none offered a value from memory.

## Grading

The test set has 18 questions with key facts that a correct answer must contain, the documents a quote should come from, and whether the question is answerable. The grader checks all three:

```
@include projects/p08-knowledge/grade.py::grade
```

| Run | Grader | Engineer | Quote problems | Output tokens | Cost (18 questions) | Seconds per answer |
| --- | --- | --- | --- | --- | --- | --- |
| Sonnet 5.5, run 1 | 18 / 18 | 18 / 18 | 0 | 4,638 | $0.20 | 4.6 |
| Sonnet 5.5, run 2 | 18 / 18 | 18 / 18 | 0 | 4,605 | $0.20 | 5.8 |
| Sonnet 5.5, run 3 | 18 / 18 | 18 / 18 | 0 | 4,467 | $0.07 | 4.6 |
| Haiku 5.5 | 17 / 18 | 17 / 18 | 0 | 9,217 | $0.03 | 5.0 |
| Opus 5.5 | 16 / 18 | 18 / 18 | 0 | 5,640 | $0.41 | 5.6 |

Not one of the 115 quotes across the five runs failed the check. Every model answered every answerable question with the right facts, and every model refused the ISO trap.

The differences between "Grader" and "Engineer" are the grader's limits, not the assistant's. The grader looks for key words. Opus wrote "one movement could start using an old value" where the key word was "stale", and "redo the worst-case CAN transmit queue calculation" where the key phrase was "worst-case queue calculation". Both answers were right. The engineer reviewed every answer the grader marked wrong and recorded the decisions in `engineer-review.json`.

> **Note:** One of the key words had already been loosened once, after the first Sonnet run, when "before the thermal task" proved too literal. Chasing every correct paraphrase with new key words is a losing game. The better pattern is the one used here: a strict automatic grader, and a recorded human review of what it rejects.

Haiku's one real miss was subtle. Asked for the warranty cost, it wrote "The documents give only a partial answer ... they don't give a monetary cost", which is correct, but set `found` to true. A program that relies on the flag, such as a chat front end that shows "No answer in the documents" when `found` is false, would treat it as answered. The prompt invited this by saying "a partial answer is fine". Flags that code relies on need unambiguous definitions.

The cost of the third Sonnet run, 7 cents instead of 20, isn't a mistake. The documents are in the system prompt, which is the same for every question, and Claude caches a repeated prompt prefix. Writing it to the cache costs more than normal input, and reading it back costs a tenth of the normal price. Runs 1 and 2 started hours apart, so each wrote the cache again: 33,275 tokens of cache writes each, which made up most of their cost. Run 3 started right after run 2 and read everything from the cache. Putting the large, unchanging part of a prompt first and the question last, and asking questions in batches, makes a knowledge assistant much cheaper to run.

## A Project in claude.ai, or a Tool?

Chapter 2 mentioned that a claude.ai Project can hold the same documents and an instruction to answer only from them. For a small team exploring its own documents, that's a fine start, with no code at all. The tool in this chapter adds what a Project can't give you:

| | claude.ai Project | This tool |
| --- | --- | --- |
| Setup | Minutes, no code | A short program |
| Quotes checked against the source | By the reader | By code, every time |
| "Not found" as a field programs can use | No | Yes |
| Graded test questions, rerun after every change | Manual | Automatic |
| Part of other tools (the nightly assistant, a chat page) | No | Yes |
| Control of what is sent and logged | Through the account settings | In the code |

Use a Project to learn what questions people ask. Build the tool when the answers start to matter.

## When the Documents Don't Fit

A real lessons-learned library has thousands of documents. Then the program needs a search step before the question: find the ten most relevant passages, and give Claude only those. The rest of this chapter doesn't change. The answer still quotes, code still checks the quotes against the full documents, and the grader still runs the same questions. Search does add one new failure mode: the right passage might not be found, and the assistant would correctly say "the documents don't say". Grade the search separately, by checking whether the expected source is among the passages found for each test question.

## Key Takeaways

- Answer only from the documents, quote them, and let code check every quote; in five runs, none of 115 quotes failed.
- Give the assistant a respectable way to say "not found", and define every flag that code relies on without ambiguity.
- Every model answered all fifteen answerable questions correctly and refused the ISO trap; Sonnet scored 18 of 18 in all three runs.
- Grade with key words, then review what the grader rejects. Don't keep loosening the keys.
- Put the unchanging documents first in the prompt; when the cache was already warm, 18 answers cost 7 cents instead of 20.
