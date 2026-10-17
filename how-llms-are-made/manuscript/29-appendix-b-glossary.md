# Appendix B: Glossary

**A/B test.** Giving some users a new version and others the old one, then comparing results.

**Active parameters.** In a mixture-of-experts model, the parameters actually used for each token, as opposed to the total. DeepSeek-V3 has 671 billion parameters, 37 billion active.

**Agent.** A model running in a loop that chooses and uses tools to achieve a goal over many steps.

**Alignment.** Making an AI system genuinely pursue the goals its makers and users intend.

**Annealing.** The final phase of pretraining, when the learning rate is lowered and the best data is used.

**Attention.** The Transformer's mechanism for letting each token draw information from the other tokens that are relevant to it.

**Attention head.** One of many parallel attention calculations in a layer, each tracking a different kind of relationship.

**Backpropagation.** The algorithm that works out, in one backward pass, how to adjust every parameter to reduce the loss.

**Base model.** A model after pretraining but before post-training: a powerful text predictor, not yet an assistant.

**Batch.** A group of training examples, or of user requests, processed together.

**Benchmark.** A fixed set of tasks with known answers, used to compare models.

**BPE (byte-pair encoding).** A tokenizer method that builds a vocabulary by repeatedly merging the most common pairs of symbols.

**Chain of thought.** Step-by-step reasoning written out by a model before its answer.

**Chat template.** The special tokens that mark who is speaking in a conversation, such as system, user and assistant.

**Checkpoint.** A saved copy of a model's parameters during training, used to recover from failures.

**Classifier.** A model that sorts inputs into categories, for example to detect harmful content.

**Context window.** The maximum amount of text, in tokens, a model can consider at once.

**Contamination.** When benchmark questions or answers have leaked into a model's training data.

**Data center.** A building full of computers; an "AI factory" when built for AI chips.

**Decode.** The phase of inference that generates output tokens one at a time.

**Dense model.** A model that uses all its parameters for every token.

**Diffusion model.** A generator that learns to remove noise, and creates images or video by gradually denoising random noise.

**Distillation.** Training a small "student" model to imitate a larger "teacher".

**DPO (Direct Preference Optimization).** A simpler alternative to RLHF that trains directly on preferred and rejected answers.

**Embedding.** A long list of numbers that places a token, sentence or image on a map of meaning.

**Emergent ability.** A skill that seems to appear suddenly as models grow; whether it is truly sudden is debated.

**Epoch.** One complete pass through a training dataset. (Also the name of the research group Epoch AI.)

**Feed-forward network.** The part of each Transformer layer that processes each token on its own after attention.

**Fine-tuning.** Further training of a model on a specific dataset to specialize it.

**FLOP.** A floating-point operation: one basic arithmetic step on a number. Training compute is measured in FLOPs.

**Foundation model.** A large model trained on broad data that can be adapted to many tasks.

**GAN (generative adversarial network).** A generator and a discriminator trained against each other.

**GPU (graphics processing unit).** A chip with thousands of simple cores, originally for graphics, now the main AI chip.

**Gradient descent.** Training by taking small steps "downhill" on the loss.

**Held-out data.** Data kept out of training and used only to test the model.

**Hallucination.** Fluent, confident output that is false or made up.

**HBM (high-bandwidth memory).** Stacked memory chips placed beside an AI processor to feed it data quickly.

**Inference.** Using a trained model to produce outputs.

**Judge model (LLM-as-a-judge).** A strong model used to grade or compare other models' answers.

**Jailbreak.** A prompt designed to trick a model into ignoring its safety training.

**KV cache.** Stored keys and values for earlier tokens, so they don't have to be recomputed while generating.

**Latent diffusion.** Diffusion performed in a compressed representation of images, which is much faster.

**Layer.** One block of a Transformer, containing attention and a feed-forward network; models stack dozens or hundreds.

**Learning rate.** How big a step each training update takes.

**LoRA.** Low-Rank Adaptation: fine-tuning by training small adapter tables while freezing the original model.

**Loss.** A number measuring how wrong a model's predictions are; training tries to reduce it.

**MCP (Model Context Protocol).** An open standard for connecting AI applications to tools and data.

**Mixture of experts (MoE).** A design in which a router sends each token to a few of many expert subnetworks.

**Model card.** A document describing a model's abilities, training, testing and limits; also called a system card.

**Multimodal.** Able to handle more than one kind of data, such as text, images, audio and video.

**Open weights.** A model whose trained parameters are published for anyone to download.

**Overfitting.** Memorizing training data instead of learning general patterns.

**Parameter.** One of the adjustable numbers inside a neural network; models have billions.

**Post-training.** All training after pretraining that turns a base model into a helpful, safe assistant.

**Prefill.** The phase of inference that reads the whole input in parallel.

**Pretraining.** The main training stage, predicting the next token on trillions of tokens of text.

**Prompt.** The input given to a model.

**Prompt injection.** Hidden instructions in content a model reads, aimed at hijacking its behavior.

**PUE (power usage effectiveness).** A data center's total energy divided by the energy used by its computers.

**Quantization.** Storing parameters with fewer bits to make a model smaller and faster.

**RAG (retrieval-augmented generation).** Fetching relevant documents at question time and giving them to the model.

**Regression.** A skill that gets worse in a new version of a model.

**Reasoning model.** A model trained, usually with reinforcement learning, to think step by step before answering.

**Red-teaming.** Deliberately trying to make a model behave badly, to find and fix weaknesses.

**Reinforcement learning.** Learning by trial and error from rewards.

**Reward model.** A model trained to score answers the way people would.

**RLHF.** Reinforcement learning from human feedback.

**RoPE (rotary position embedding).** A common way of telling a Transformer the position of each token.

**Sampling.** Choosing the next token from the model's probabilities, rather than always taking the most likely one.

**Scaling laws.** The predictable relationship between a model's size, data, compute and performance.

**Speculative decoding.** Speeding up generation by letting a small model guess tokens that a big model checks.

**Supervised fine-tuning (SFT).** Training on examples of ideal responses.

**Synthetic data.** Training data generated by AI models.

**System prompt.** Instructions placed before a conversation to set a model's role and rules.

**Temperature.** A setting that controls how random a model's sampling is.

**Tensor core.** A circuit in a GPU designed specifically to multiply grids of numbers.

**Test-time compute.** Computation spent while answering, for example by reasoning longer.

**Token.** A small piece of text, often part of a word, that a model reads and writes.

**Tokenizer.** The program that splits text into tokens and converts them to ID numbers.

**TPU (Tensor Processing Unit).** Google's custom AI chip.

**Transformer.** The neural network design, built on attention, behind nearly all modern language models.

**Validation.** The staged testing of a model, during training and before and after release, to confirm its skills and safety.

**Vector database.** A database designed to search embeddings by similarity.

**Vision Transformer (ViT).** A Transformer that reads images as sequences of patches.

**Vocabulary.** The full set of tokens a tokenizer can produce.

**Water consumption / withdrawal.** Withdrawal is water taken from a source; consumption is water lost, mainly by evaporation.

**World model.** A model that generates an environment that responds to actions, or that predicts how the world will change.
