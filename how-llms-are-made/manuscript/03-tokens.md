# Chapter 3: Tokens: How Machines Read

Computers don't read letters or words. Underneath everything, they work with numbers. So the very first step in building a language model, before any learning can happen, is deciding how to chop text into pieces and give each piece a number. Those pieces are called **tokens**, and the program that does the chopping is the **tokenizer**. It sounds like a technical detail, but tokens explain a surprising number of things about language models: why they're priced the way they are, why they sometimes can't count letters, and why using them in some languages costs more than in others.

## Why Not Letters? Why Not Words?

There are two obvious ways to turn text into numbers, and both have problems.

**One number per letter.** Easy, and only about a hundred symbols are needed for English. But then a single sentence becomes a long string of numbers, and the model has to work very hard to learn that *c-a-t* means a small furry animal. Long sequences are also expensive to process, as you'll see in Chapter 7.

**One number per word.** Much shorter sequences, but how many words are there? English alone has hundreds of thousands, plus names, misspellings, numbers, code, emoji and every other language on earth. A word the tokenizer has never seen, such as a new product name, would simply be unreadable.

Modern tokenizers use a compromise: **subwords**. Common words get a single token. Rarer words are built from a few common pieces. Anything at all can still be spelled out, if necessary, from individual characters or even raw bytes, so nothing is ever unreadable.

## How a Tokenizer Learns Its Pieces

The most widely used method is called **byte-pair encoding (BPE)**. It was invented in 1994 by **Philip Gage** as a way to compress files, and adapted for language by **Rico Sennrich**, **Barry Haddow** and **Alexandra Birch** in 2015. The idea is beautifully simple. In its simplest, character-level form:

1. Start with every individual character as a token.
2. Look through a large amount of text and find the pair of neighboring tokens that appears most often.
3. Merge that pair into a new token, and add it to the vocabulary.
4. Repeat, tens of thousands of times.

Most modern tokenizers, including GPT's and Llama's, use **byte-level BPE**: they start from the 256 possible **bytes**, the basic units computers use to store text, rather than from characters, so any text in any language, and even emoji, can be represented. The merging process is the same. Here is the simple character-level version run for real on a tiny sample of seven words, *low lower lowest slow slower newest widest*, with "_" marking the end of each word:

```
Start: low_ lower_ lowest_ slow_ slower_ newest_ widest_
Merge 1: 'l' + 'o' -> 'lo' (seen 5 times)
Merge 2: 'lo' + 'w' -> 'low' (seen 5 times)
Merge 3: 'low' + 'e' -> 'lowe' (seen 3 times)
Merge 4: 's' + 't' -> 'st' (seen 3 times)
Merge 5: 'st' + '_' -> 'st_' (seen 3 times)
Merge 6: 'low' + '_' -> 'low_' (seen 2 times)
Merge 7: 'lowe' + 'r' -> 'lower' (seen 2 times)
Merge 8: 'lower' + '_' -> 'lower_' (seen 2 times)
Result: low_ | lower_ | lowe st_ | s low_ | s lower_ | n e w e st_ | w i d e st_
```

After just eight merges, the tokenizer has discovered "low" and "lower" as whole pieces, and "st_" as a common word ending, and it splits *slower* into "s" + "lower". Nobody told it about English. It found the patterns by counting. Real tokenizers do exactly this on billions of words of text in many languages, until they have a vocabulary of the desired size.

> **In Plain Words:** A tokenizer learns its vocabulary by repeatedly gluing together the pairs of letters and pieces that appear most often, so common words become single tokens and rare words are built from a few parts.

## How Big Is the Vocabulary?

Each token gets an ID number, and the list of all of them is the **vocabulary**. Vocabularies have grown over time:

| Model | Vocabulary size |
| --- | --- |
| GPT-2 (2019) | 50,257 tokens |
| Llama 3 (2024) | 128,256 tokens |
| Recent multilingual models | 150,000 to 260,000 tokens |

GPT-2's number has a neat explanation: 256 tokens for the 256 possible bytes, 50,000 learned merges, and one special token that marks the end of a text. Larger vocabularies let common words and pieces in more languages fit in single tokens, which makes text shorter and processing cheaper, at the cost of a larger table inside the model.

Besides ordinary text, vocabularies include **special tokens** that never appear in normal writing: markers for the start and end of a message, for who is speaking (the user or the assistant), and, in newer models, for the beginning and end of the model's hidden reasoning, or for a tool call. These invisible signposts are how a model knows the structure of a conversation.

## Rules of Thumb

For English text, OpenAI's guidance is that a token is, on average, about four characters, or three-quarters of a word: 100 tokens is roughly 75 words. So a typical 300-page novel of 100,000 words is around 130,000 tokens. Code, numbers and other languages usually need more tokens per word.

This matters because nearly everything about language models is measured in tokens:

- **Price.** Companies charge per million tokens of input and output.
- **Speed.** Models generate a certain number of tokens per second.
- **Memory.** The **context window**, the amount of text a model can consider at once, is measured in tokens: from 2,048 tokens for GPT-3 to a million or more for some models today (Chapter 19).
- **Training data.** Datasets are measured in tokens: Llama 3 was trained on about 15 trillion.

## The Strawberry Problem

In 2024, people noticed that some of the most advanced chatbots couldn't answer a question a six-year-old can: *how many r's are there in "strawberry"?* Many confidently said two.

Tokens explain why. GPT-4's tokenizer splits "strawberry" into three pieces: *str*, *aw* and *berry*. The model never sees the individual letters, only three token numbers. Asking it to count the r's is a bit like asking you how many brush strokes are in a printed Chinese character you've only ever seen as a whole. The model has to have learned, from elsewhere, how each token is spelled, and then count correctly, and both steps can go wrong.

> **Did You Know?** The strawberry question became so famous that it turned into an informal test for every new model. Newer models usually get it right, partly by spelling the word out letter by letter before counting, a small example of the "thinking before answering" you'll meet in Chapter 14.

The same blindness to letters explains why models have historically struggled with rhymes, anagrams, reversing words and some arithmetic on long numbers: digits may be grouped into tokens in unhelpful ways.

## The Token Tax

Tokenizers are trained mostly on the text that's most plentiful online, which is overwhelmingly English. As a result, English words tend to get efficient single tokens, while words in many other languages are broken into many small pieces.

In 2023, **Aleksandar Petrov** and colleagues at the University of Oxford measured this. The same text translated into different languages could take **up to 15 times more tokens** in some languages than in others, even with tokenizers designed to be multilingual. Since people pay per token, and context windows are measured in tokens, speakers of those languages pay more, wait longer and fit less text into the model's memory for the same content. This is sometimes called the **token tax**, and it's one reason newer models use much larger vocabularies with more pieces from more languages. Meta, for example, added 28,000 extra tokens for non-English languages to the 100,000 it took from an existing tokenizer when building Llama 3's vocabulary.

## From Tokens to Numbers the Model Can Use

After tokenization, a sentence is just a list of IDs, perhaps `[1102, 374, 264, 9919, 1938]`. But a single ID number says nothing about meaning: token 1102 isn't "bigger" or "more similar" to token 1103 in any useful way. The next step turns each ID into a long list of numbers that *does* capture meaning. That list is called an **embedding**, and it's where the model's understanding begins.

## Key Takeaways

- Models read **tokens**, pieces of text, each with an ID number. Common words are one token; rare words are several.
- Most tokenizers use **byte-pair encoding**: start with characters or, in most modern models, bytes, and repeatedly merge the most frequent pair.
- Vocabularies range from about 50,000 to over 250,000 tokens, plus special tokens that mark speakers, messages and tool calls.
- In English, a token averages about four characters, or three-quarters of a word. Prices, speed, context windows and training data are all measured in tokens.
- Tokens explain the "strawberry" problem and the **token tax**: some languages need up to 15 times more tokens for the same text.

## Sources and Further Reading

- Philip Gage, "A New Algorithm for Data Compression," *C Users Journal* 12, no. 2 (1994).
- Rico Sennrich, Barry Haddow, Alexandra Birch, "Neural Machine Translation of Rare Words with Subword Units," 2015. arxiv.org/abs/1508.07909
- OpenAI Help Center, "What are tokens and how to count them." help.openai.com/en/articles/4936856
- Llama Team, Meta, "The Llama 3 Herd of Models," 2024 (128K vocabulary; 100K from tiktoken plus 28K for other languages). arxiv.org/abs/2407.21783
- Kyle Wiggers, "Why AI can't spell 'strawberry'," *TechCrunch*, 27 August 2024. techcrunch.com/2024/08/27/why-ai-cant-spell-strawberry
- Aleksandar Petrov, Emanuele La Malfa, Philip Torr, Adel Bibi, "Language Model Tokenizers Introduce Unfairness Between Languages," NeurIPS 2023. arxiv.org/abs/2305.15425
- The toy BPE example in this chapter was computed by the author with a short program that implements the algorithm described above.
