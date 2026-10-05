# Part IV: Advanced Prompt Engineering

# Chapter 15: System Prompts and Building with APIs

Up to now, you've mostly written prompts for yourself, in a chat window, where you can see the output and correct it. Advanced prompt engineering is about prompts that run without you: inside apps, chatbots, automations, and agents, processing inputs you never see. This chapter covers the foundation of that work: system prompts and API parameters.

## What a System Prompt Does

The **system prompt** sets the model's behavior for an entire conversation or application. It defines who the assistant is, what it does, how it behaves, and what it won't do. Users usually never see it. When you build a custom GPT, a Claude Project, a Gemini Gem, or an API application, you are writing a system prompt.

A good system prompt has to handle not just the requests you expect, but also the strange, ambiguous, and adversarial ones you don't. That's what makes it harder than a one-off prompt.

## Anatomy of a Production System Prompt

A robust system prompt typically includes these sections:

```
# Identity and purpose
You are Ava, the customer support assistant for Thermivo, a
company that sells smart thermostats and home sensors. You help
customers set up devices, troubleshoot problems, and understand
their orders.

# Audience
Customers range from tech-savvy to complete beginners. Many contact
support when they're frustrated. Assume no technical knowledge
unless the customer shows it.

# Knowledge and sources
Answer product questions using the documentation provided in
<docs>. If the docs don't cover a question, say you're not sure
and offer to connect the customer with a human agent. Never guess
about compatibility, safety, or electrical wiring.

# How to respond
- Be warm, patient, and concise. Use short paragraphs.
- For troubleshooting, give one step at a time and ask the customer
  to confirm the result before moving on.
- Use plain text; the chat widget does not render Markdown.

# Tools
- Use lookup_order when a customer asks about an order. Always ask
  for the order number first.
- Use create_ticket when an issue can't be resolved in chat.

# Boundaries
- Don't offer refunds or discounts; explain that a human agent
  handles those, and create a ticket.
- Don't discuss competitors' products.
- If a customer mentions a safety hazard (sparks, burning smell,
  smoke), tell them to turn off power at the breaker and contact
  a licensed electrician immediately, then create an urgent ticket.

# Examples
<example>
Customer: my thermostat screen is blank
Ava: I'm sorry about that - let's get it working again. First,
could you check whether the circuit breaker for your heating
system is switched on?
</example>
```

Notice the qualities that make this effective:

- **Specific identity and scope:** The model knows exactly what it's for.
- **Explicit audience:** It can calibrate tone and detail.
- **Grounding rules:** It knows where knowledge comes from and what to do when it's missing.
- **Behavioral guidance with reasons:** "The chat widget does not render Markdown" explains a formatting rule.
- **Clear escalation paths:** It knows when to hand off to a human.
- **Safety-critical instructions:** High-stakes situations are handled explicitly.
- **Examples** that show the desired voice.

## System Prompt Best Practices

**1. Write for a smart new employee.** Include what a capable person would need on day one: purpose, audience, policies, procedures, and judgment calls.

**2. Explain priorities and trade-offs.** When rules conflict, which wins? For example: "Accuracy matters more than speed. If unsure, ask a clarifying question rather than guessing."

**3. Handle edge cases explicitly.** What if the user writes in another language? Asks something off-topic? Is abusive? Asks for the system prompt? Each unaddressed case is left to the model's guess.

**4. Don't overload with rules.** A system prompt with 150 absolute rules is hard to follow and leads to rigid behavior. Prefer principles with explanations, and reserve hard rules for truly critical boundaries.

**5. Avoid excessive emphasis.** Earlier models sometimes needed "CRITICAL" and "YOU MUST" in capital letters. Modern models follow instructions well and can overreact to heavy emphasis, becoming overly cautious. Use normal language and save emphasis for what genuinely matters most.

**6. Version and test it.** Treat your system prompt like code: store versions, record changes, and test against a set of realistic conversations before every update (see Chapter 18).

## Working with the API

When you use models through an API, you control far more than in a chat app. A typical request includes:

- **Model:** Which model to use. Match the model to the task: smaller, faster models for simple, high-volume tasks; larger or reasoning models for complex ones.
- **System prompt:** As described above.
- **Messages:** The conversation history, as a list of user and assistant turns.
- **Max output tokens:** The maximum length of the response.
- **Temperature and related sampling settings:** Lower for consistency, higher for variety. Some reasoning models fix or ignore these.
- **Reasoning or thinking settings:** On reasoning models, how much effort to spend.
- **Tools:** Functions the model can call (Chapter 17).
- **Structured output schema:** To enforce a JSON format (Chapter 6).
- **Stop sequences:** Text that, when generated, ends the response.

### Managing Conversation State

APIs are generally **stateless**: the model doesn't remember previous requests. To have a conversation, your application sends the relevant history with each request. This gives you control: you can trim old messages, summarize long histories, or inject relevant context. Some platforms also offer server-side conversation state; consult their documentation.

### Prompt Caching

When many requests share a long, identical beginning, such as a big system prompt or a reference document, **prompt caching** lets the provider reuse the processed prefix, reducing cost and latency significantly. To benefit, put stable content (system prompt, tools, documents) at the beginning and variable content (the user's question) at the end. Check your provider's documentation for how caching is enabled and priced.

### Prefilling and Output Steering

Some APIs have historically allowed you to start the assistant's response yourself, for example beginning it with `{` to force JSON. Support for this varies by provider and model, and structured output features are now the more reliable way to enforce formats. Where prefilling is unsupported, use clear format instructions and schemas instead.

## Templates and Variables

In applications, prompts are usually templates with variables filled in at runtime:

```
Summarize the following support ticket for the {team_name} team.
Customer tier: {customer_tier}
Ticket:
<ticket>
{ticket_text}
</ticket>
```

Good template hygiene:

- **Wrap variable content in delimiters** so it can't be confused with instructions.
- **Validate and sanitize inputs** such as length limits and allowed characters.
- **Handle empty variables.** What happens if `{customer_tier}` is blank?
- **Keep templates in version control**, separate from code, so they can be reviewed and tested.

## Choosing the Right Model

Model selection is part of prompt engineering. Consider:

- **Task complexity:** Simple classification and extraction rarely need the largest model.
- **Latency:** Real-time chat needs fast responses; overnight batch jobs don't.
- **Cost:** At high volume, smaller models can be dramatically cheaper.
- **Context needs:** How much text must the model see at once?
- **Modality:** Do you need image, audio, or video input?

A common pattern is **routing**: a small, fast model handles easy requests and escalates difficult ones to a more capable model. Always evaluate on your actual task rather than relying on general benchmarks.

## Key Takeaways

- System prompts define an application's identity, audience, knowledge, behavior, tools, and boundaries.
- Write for a smart new employee: explain purpose, priorities, edge cases, and reasons.
- Prefer principles to piles of rules, and avoid excessive emphasis with modern models.
- APIs give you control over model choice, parameters, conversation state, tools, and output schemas.
- Use caching-friendly prompt structure, delimited templates, and evaluation-driven model selection.
