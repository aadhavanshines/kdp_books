# Part I: The Big Idea

# Chapter 1: A Machine That Predicts the Next Word

Every large language model, from the chatbot on your phone to the most powerful system in a research lab, is built around one deceptively simple task: **given some text, predict what comes next**. Everything else, the essays, the code, the jokes, the apparent reasoning, grows out of doing that one thing extremely well. This chapter explains the trick, why it is far more powerful than it sounds, and what it means for how you should think about these machines.

## A Game You Already Play

Read this sentence and notice what happens in your head:

*"It was a cold winter morning, and the ground was covered in ..."*

You probably thought "snow" before you reached the end. You didn't look it up. You've read and heard enough language to know what usually follows. If someone asked you how sure you were, you might say "very sure it's snow, a little chance of frost or ice, almost no chance of bananas".

That is exactly what a language model does. Given the text so far, it produces a list of possible next words, each with a probability:

![A language model reads "It was a cold winter morning, and the ground was covered in" and gives probabilities for the next word: snow highest, then frost, ice and leaves, with bananas almost zero. One word is chosen, added to the text, and the process repeats.](images/diagram-next-word.png)

The numbers in the picture are illustrative, but the shape is real: a few likely words, a long tail of unlikely ones.

> **Did You Know?** In 1951, the American mathematician Claude Shannon, the founder of information theory, played this game with people. He showed volunteers the beginning of a passage of English and asked them to guess the next letter, over and over, to measure how predictable English is. His paper, "Prediction and Entropy of Printed English," is one of the ancestors of every modern language model.

## One Word at a Time

To write a whole answer, the model repeats the trick in a loop:

1. Read all the text so far.
2. Predict the probabilities for the next word.
3. Pick one word, usually one of the likely ones.
4. Add it to the end of the text, and go back to step 1.

That's why answers from a chatbot appear a word or two at a time: they are being written one piece at a time, each piece chosen in light of everything before it. A model never plans a whole paragraph in the way a person might outline an essay. Each word is a fresh prediction, though, as you'll see in later chapters, the model's inner workings do carry information about where a sentence is heading.

Strictly speaking, models work with **tokens**, which are pieces of words, rather than whole words. A token might be "snow", or just "sn", or a space followed by "the". Chapter 3 explains why. For now, "word" is close enough.

> **In Plain Words:** A language model is a very sophisticated autocomplete. It looks at the text so far and guesses the next piece, again and again.

## Why Not Always Pick the Most Likely Word?

If the model always chose the single most likely word, its writing would be dull and repetitive, and it would give the same answer every time. So most systems **sample**: they pick the next word at random, but weighted by the probabilities. "Snow" gets picked most of the time; "frost" sometimes; "bananas" practically never.

A setting called **temperature** controls how adventurous this choice is. Low temperature makes the model stick to the most likely words: good for facts and code. Higher temperature flattens the probabilities, so less likely words get picked more often: good for brainstorming and poetry, but more prone to nonsense. This is why asking the same question twice can give two different answers. Neither is "the" answer stored somewhere; each is a fresh walk through the probabilities.

## How Can Guessing Words Produce Intelligence?

This is the part that surprises everyone, including, at first, many of the researchers who built these systems. To predict the next word *really well*, across all the text people have ever written, a model has to pick up a great deal about the world.

Think about what it takes to predict the next word in each of these:

- *"The capital of Japan is ..."* requires geography.
- *"If I have three apples and eat one, I have ..."* requires arithmetic.
- *"She dropped the glass on the stone floor, and it ..."* requires everyday physics.
- *"def add(a, b): return ..."* requires programming.
- *"He said he was fine, but his voice was shaking. He was ..."* requires an understanding of people.

A model that has been trained to predict billions of sentences like these is pushed, step by tiny step, to build internal patterns that capture facts, grammar, logic, style and common sense, because those patterns make its predictions better. Nobody programs the facts in. They are absorbed, the way a child absorbs grammar without ever being taught the rules.

Researchers sometimes describe this as **compression**. A model has far fewer numbers inside it than the text it was trained on contains letters. To predict that much text with that little space, it can't memorize everything; it has to find the underlying regularities. Learning the rule "add the numbers" is far more compact than memorizing every sum ever written.

## What a Language Model Is Not

Understanding the next-word trick clears up several common misconceptions.

**It is not a database of answers.** There is no table inside that says "capital of Japan: Tokyo". The knowledge is spread across billions of numbers, in a form nobody fully understands yet. That's why a model can answer questions nobody has asked before, and also why it can't simply "look up" and show you where a fact came from, unless it is connected to a search tool (Chapter 19).

**It is not a search engine.** A search engine finds existing documents. A language model writes new text, word by word. When you ask it for a recipe, it isn't retrieving a recipe; it is composing one that fits the patterns of all the recipes it has seen.

**It can be confidently wrong.** Because the model's job is to produce *plausible* text, it will sometimes produce a plausible-sounding sentence that is false: a book that doesn't exist, a quote nobody said, a wrong date. This is called **hallucination**. It isn't lying, since the model has no intention to deceive, and it isn't a rare glitch; it is a natural side effect of a system built to continue text fluently. Much of the work you'll read about in Part IV, and many of the tools in Part V, exist to reduce it.

> **Did You Know?** The autocomplete on your phone's keyboard is a tiny language model. It does the same job, guessing the next word, with a model many thousands of times smaller than the ones behind modern chatbots.

## What Makes It "Large"?

A language model is a kind of **neural network**, a mathematical structure loosely inspired by the brain and made of a huge number of adjustable numbers called **parameters**. You can picture parameters as the knobs on an enormous mixing desk. Training is the process of turning all those knobs, a tiny amount at a time, until the model's predictions become good. Chapter 6 explains how.

"Large" refers to the number of knobs and the amount of text used to set them. The models of the early 2010s had millions of parameters. GPT-3, in 2020, had 175 billion. Today's largest models are reported to have more than a trillion, trained on tens of trillions of words. That scale, more than any single clever idea, is what turned autocomplete into something that can pass exams and write working software, and it is why making these models takes data centers, enormous amounts of electricity and months of computing time.

## The Three Stages of a Model's Life

Every chatbot you have used went through three big stages, which the rest of this book explores in turn:

1. **Pretraining.** The model reads a vast amount of text and learns to predict the next word. The result is a powerful but raw text-continuer that will happily continue any text, including a question, with more questions. (Chapters 5 to 12.)
2. **Post-training.** The raw model is taught to behave like an assistant: to answer questions, follow instructions, refuse harmful requests and, in newer models, to reason step by step. (Chapters 13 to 16.)
3. **Inference.** The finished model is put to work answering millions of people, one token at a time, often connected to tools such as search engines and code runners. (Chapters 17 to 20.)

Before we dive into how each stage works, it's worth seeing how humanity got here. The idea of a talking machine is much older than you might think.

## Key Takeaways

- A large language model does one thing: given text, it predicts probabilities for the next piece of text, then repeats.
- It writes answers one token at a time, sampling from those probabilities; temperature controls how adventurous the choices are.
- Predicting text well forces the model to absorb facts, grammar, reasoning and common sense, because they all make predictions better.
- It isn't a database or a search engine, and it can confidently produce plausible but false text, called hallucination.
- "Large" means billions to trillions of adjustable numbers, trained on trillions of words. Every model goes through pretraining, post-training and inference.

## Sources and Further Reading

- Claude E. Shannon, "Prediction and Entropy of Printed English," *Bell System Technical Journal* 30 (1951): 50-64.
- Tom B. Brown et al., "Language Models are Few-Shot Learners" (GPT-3, 175 billion parameters), 2020. arxiv.org/abs/2005.14165
- Reuters, "ChatGPT sets record for fastest-growing user base - analyst note," 2 February 2023 (UBS estimate of 100 million monthly users in January 2023).
