# Chapter 14: Prompting Image, Video, and Audio Generators

Generative AI isn't limited to text. Image generators such as Midjourney, ChatGPT's image generation, Google's Imagen, Adobe Firefly, Stable Diffusion, and Flux; video generators such as OpenAI's Sora, Google's Veo, Runway, Kling, and Pika; and audio tools such as Suno, Udio, and ElevenLabs all respond to prompts. Visual and audio prompting uses a different vocabulary than text prompting, and this chapter teaches it.

## How Visual Prompting Differs

Text assistants understand instructions and conversation. Many image generators, particularly older or specialized ones, respond better to **descriptions** than to instructions. Instead of "Can you make me a picture of a cat?", describe the image itself: "A ginger cat sleeping on a sunlit windowsill, soft morning light, cozy, photorealistic."

Newer image models built into chat assistants understand natural conversational language much better, including requests to edit an image step by step. But descriptive, specific prompts still produce better results everywhere.

## The Image Prompt Formula

A strong image prompt usually covers these elements:

1. **Subject:** What is the main focus? Be specific about appearance, action, and expression.
2. **Setting:** Where is it? What surrounds the subject?
3. **Style or medium:** Photograph, oil painting, watercolor, 3D render, flat vector illustration, anime, pencil sketch.
4. **Composition:** Close-up, wide shot, aerial view, symmetrical, rule of thirds, low angle.
5. **Lighting:** Golden hour, soft diffused light, dramatic side lighting, neon, overcast.
6. **Color and mood:** Pastel palette, muted earth tones, vibrant, moody, serene.
7. **Details and quality:** Textures, materials, level of detail, camera and lens descriptions for photos.

**Weak:**

```
a city at night
```

**Strong:**

```
A rain-soaked street in Tokyo at night, neon signs reflecting in
puddles, a lone figure with a clear umbrella walking away from the
camera, cinematic wide shot, shallow depth of field, cool blue and
magenta color palette, moody atmosphere, photorealistic.
```

> **Tip:** Put the most important elements first. Many image models give more weight to words at the beginning of the prompt.

## Midjourney

Midjourney is known for its striking aesthetic quality. Key prompting concepts:

- **Concise, evocative descriptions** often work better than long instructions. Focus on what you want to see.
- **Parameters** appended to the prompt control output. Common ones include aspect ratio (`--ar 16:9`), stylization (`--stylize`), and chaos or variety (`--chaos`). Check the current documentation, as parameters change between versions.
- **Image references** let you guide the style, character, or composition using existing images.
- **Iterate with variations, upscaling, and region editing** rather than rewriting from scratch.

Example:

```
editorial portrait of an elderly fisherman mending nets on a
wooden dock, weathered hands, overcast morning light, muted blue
and grey tones, 85mm lens, shallow depth of field --ar 4:5
```

## Image Generation in Chat Assistants

ChatGPT, Gemini, and other assistants can generate and edit images conversationally. Their advantages:

- **Natural language understanding:** You can describe complex scenes, layouts, and relationships between objects in ordinary sentences.
- **Text in images:** Newer models render text such as posters, labels, and infographics much more accurately than older ones. Put the exact text in quotation marks.
- **Iterative editing:** "Make the sky more dramatic," "change her jacket to red," "remove the car in the background."
- **Consistency across a conversation:** You can ask for multiple images featuring the same character or style.

Example:

```
Create a poster for a community bake sale. Title at the top in a
playful hand-lettered style: "Sweet Saturday Bake Sale". Below it,
an illustration of cupcakes, pies, and cookies on a checkered
tablecloth. At the bottom, the text: "June 14, 10am-2pm, Maple
Street Library". Warm pastel colors, friendly and inviting.
Portrait orientation.
```

## Stable Diffusion and Flux

Stable Diffusion and Flux are image models that can be run locally or through many online services, offering deep control. Key concepts:

- **Negative prompts:** Many interfaces let you list what to exclude, such as "blurry, extra fingers, watermark, text."
- **Weighting:** Some interfaces allow emphasizing terms with special syntax.
- **Settings:** Steps, guidance scale (how strictly to follow the prompt), seed (for reproducibility), and sampler all affect results.
- **Extensions:** Tools like ControlNet (for pose and composition control), LoRAs (small add-on models for specific styles or characters), and inpainting (editing parts of an image) give fine-grained control.
- **Model-specific prompt styles:** Different models and fine-tunes respond best to different prompt styles, some to natural sentences and others to comma-separated tags. Check the model's documentation or community examples.

## Video Generation

AI video generators turn text or images into short video clips. Video prompts need everything an image prompt needs, plus **motion and time**:

- **Subject action:** What happens? "A barista pours steamed milk, forming a leaf pattern."
- **Camera movement:** Static shot, slow dolly in, pan left, drone flyover, handheld, tracking shot.
- **Pacing:** Slow motion, time-lapse, real time.
- **Scene progression:** What changes from the beginning to the end of the clip?
- **Audio**, where supported: dialogue, ambient sound, music.

Example:

```
Close-up of a barista's hands pouring steamed milk into a latte,
the milk forming a leaf pattern. Slow motion. Static camera,
slightly above the cup. Warm cafe lighting, shallow depth of
field, soft background chatter and the hiss of the espresso
machine.
```

Tips:

- **Keep each clip to one main action.** Complex sequences are better built from multiple clips.
- **Start from an image** (image-to-video) when you need precise control over the look.
- **Describe the camera like a cinematographer.** Film terms produce more controlled results.
- **Expect to generate several takes** and pick the best.

## Audio and Music

**Music generators** such as Suno and Udio create songs from prompts. Describe:

- **Genre and subgenre:** "1970s funk," "lo-fi hip hop," "Celtic folk."
- **Mood and energy:** "upbeat and triumphant," "melancholic and slow."
- **Instruments:** "acoustic guitar, upright bass, brushed drums."
- **Vocals:** "warm female vocals," "instrumental only," "male choir."
- **Lyrics:** Write your own for best results, or give the theme.

**Voice tools** such as ElevenLabs generate speech. Prompt with the text plus guidance on tone, pace, and emotion, and use punctuation to shape pauses and emphasis.

## Ethics and Rights in Generative Media

> **Warning:** Respect copyright, trademarks, and people's likenesses. Don't generate images or voices of real people without consent, don't create misleading content presented as real, and check each tool's terms for commercial use. Some platforms restrict prompts that reference living artists' names or copyrighted characters. For commercial projects, also consider disclosure requirements; for example, Amazon KDP asks publishers to disclose AI-generated content, including images.

## A Visual Prompt Worksheet

Before writing an image or video prompt, answer these:

- What is the subject, and what is it doing?
- Where is it, and when (time of day, era, season)?
- What style or medium?
- What framing and camera angle?
- What lighting and color palette?
- What mood should the viewer feel?
- What must be excluded?
- What size or aspect ratio do I need?

> **Try It:** Choose a simple subject, such as "a cup of coffee." Write five prompts that change only one element each time: style, lighting, composition, mood, and setting. Compare the results to learn how each element affects the image.

## Key Takeaways

- Image and video prompts describe the result: subject, setting, style, composition, lighting, and mood.
- Midjourney rewards concise, evocative prompts plus parameters; chat-based generators understand conversational descriptions and edits.
- Stable Diffusion and Flux offer negative prompts, settings, and extensions for fine control.
- Video prompts add action, camera movement, and pacing; keep each clip focused.
- Use generative media ethically and check rights and disclosure requirements.
