# Chapter 26: Video, Speech and Music

Text, then images, then everything else. The same ideas, Transformers, tokens, embeddings, diffusion and enormous datasets, have been applied to moving pictures, the human voice and music. Each brings its own difficulties: video must stay consistent over time, speech must happen in real time, and music must hold together over minutes. This chapter covers all three, and the new "world models" that blur the line between video and simulation.

## Video: Images That Move

A video is a sequence of images, typically 24 or more per second. Generating one is far harder than generating a still picture:

- **Consistency.** A person's face, clothes and surroundings must stay the same from frame to frame, even when they turn around or walk behind something.
- **Physics.** Water must flow, glass must shatter, and objects mustn't melt into each other or appear from nowhere.
- **Computation.** Ten seconds of video contains hundreds of images, all of which must be generated together.

Early attempts in 2022 and 2023, such as Meta's Make-A-Video and Runway's Gen-2, produced a few seconds of dreamlike, wobbly footage. Then came a leap.

## Sora and the "World Simulator"

In February 2024, OpenAI previewed **Sora**, which generated up to a minute of strikingly realistic video from a text prompt: a woman walking down a neon-lit Tokyo street, woolly mammoths in the snow. Sora was a **diffusion Transformer** (Chapter 25): it cut videos into **spacetime patches**, small cubes covering a patch of the picture over a few frames, which play the role that tokens play in text.

OpenAI's technical report was titled "Video generation models as world simulators". It argued that by learning to generate video, a model must learn something about how the physical world works: objects persist, people walk, liquids pour. The claim was debated, because Sora also made glaring mistakes, such as a basketball passing through a hoop, or chairs floating and morphing, but the idea of learning a world model from video took hold.

> **Did You Know?** Sora's story turned out to be short. OpenAI launched **Sora 2**, with synchronized sound, along with a social video app, in September 2025, and the app briefly topped the App Store charts. But in March 2026, OpenAI announced it would discontinue Sora; the app closed in April 2026 and the developer API in September 2026. OpenAI gave no detailed reason; reports pointed to the enormous computing cost of video and a shift in focus toward coding, business and robotics.

## The Video Race

Many competitors pushed video forward:

- **Google's Veo** family. **Veo 3** (May 2025) was the first major video model to generate **synchronized audio** natively: dialogue with matching lip movements, sound effects and music, created together with the picture. Veo 3.1 followed.
- **Runway** (New York), one of the earliest video AI companies and a co-creator of Stable Diffusion, with its Gen-4 and Gen-4.5 models, widely used in film and advertising.
- **Kling**, by the Chinese short-video company **Kuaishou**, which launched in June 2024 and reached version 3.0, known for realistic human motion.
- **Seedance**, by **ByteDance**, and **Luma AI**'s Ray models, among others.

As of 2026, the best models produce high-definition clips of up to a minute or so, with sound, controllable camera moves and consistent characters across shots. Generating long, coherent films remains out of reach without heavy human editing.

## World Models: Videos You Can Walk Into

A **world model** generates an environment that responds to your actions in real time, like a video game invented on the fly. In August 2025, Google DeepMind unveiled **Genie 3**, which generated explorable 3D worlds from a text prompt at 720p resolution and 24 frames per second, remaining consistent for several minutes: walk away from a painted wall and come back, and the paint is still there. Users could also change the world with text, such as "make it rain".

World models are interesting not just for games. They could provide unlimited training environments for robots and AI agents, which need to practice in realistic situations without breaking anything real.

## Speech: Listening

In September 2022, OpenAI released **Whisper**, a speech-recognition model trained on **680,000 hours** of audio from the web, in many languages, with its transcripts. That's about 77 years of continuous listening. Whisper was robust to accents, background noise and technical language, and could translate speech from dozens of languages into English. OpenAI released it openly, and it became the standard way to turn speech into text in countless apps.

Under the hood, Whisper uses the same encoder-decoder Transformer as the original 2017 design: audio is turned into a picture of its frequencies over time, called a **spectrogram**, which the encoder reads, and the decoder writes the text.

## Speech: Talking

Computer voices once sounded robotic. In 2016, DeepMind's **WaveNet** generated speech one tiny audio sample at a time, sounding far more natural. Modern text-to-speech treats audio like language: an **audio tokenizer** compresses sound into tokens, and a Transformer predicts the next audio token, just as a language model predicts the next word.

This made **voice cloning** possible. Microsoft's research model **VALL-E** (January 2023) could imitate a voice from a three-second sample. Companies such as **ElevenLabs** offer realistic voices in dozens of languages, used for audiobooks, dubbing and accessibility; people who have lost their voice to illness have used voice cloning to speak again in something close to their own voice.

The dark side is fraud. In January 2024, voters in New Hampshire received robocalls with an AI-generated imitation of President Joe Biden's voice telling them not to vote in the primary election. Voice-cloning scams, in which criminals impersonate a relative in distress, are a growing problem, and banks have warned against using voice alone to verify identity.

## Conversation at the Speed of Speech

Older voice assistants worked in three steps: transcribe speech to text, generate a text answer, then speak it. Each step added delay, and the tone of voice was lost. **GPT-4o** (May 2024) processed audio directly, responding in as little as 232 milliseconds, with an average of 320 milliseconds, similar to human response time in conversation, and could be interrupted, change its tone, laugh or sing. Real-time voice models are now offered by most major labs, and are used for customer service, language tutoring and live translation.

> **In Plain Words:** Modern AI turns sound into tokens too. Once speech is tokens, the same next-token machinery can listen, talk, translate and even sing.

## Music

Generating music is hard: a song must hold its melody, rhythm and structure over minutes, with lyrics that fit. OpenAI's **Jukebox** (2020) generated raw audio in the style of various artists, slowly and roughly; Google's **MusicLM** (2023) generated music from text descriptions. Then two startups made it mainstream: **Suno** (whose song generator went viral from late 2023) and **Udio** (April 2024) could produce full songs with vocals, lyrics and instruments in seconds, from a short description.

In June 2024, the major record labels, Universal, Sony and Warner, sued both companies for training on copyrighted recordings. In late 2025, Universal and Warner settled with Udio, and Warner with Suno, turning the lawsuits into licensing partnerships, with new models to be trained on licensed music. Similar debates are playing out over voices, film and every other kind of creative work.

## Key Takeaways

- Video generation must keep frames consistent, follow physics and handle huge amounts of computation; Sora (2024) used diffusion Transformers on **spacetime patches**.
- Google's **Veo 3** (2025) added native synchronized audio; Runway, Kling and Seedance are major rivals. OpenAI discontinued Sora in 2026.
- **World models** such as Genie 3 generate interactive environments in real time.
- **Whisper** (680,000 hours of audio) set the standard for speech recognition; audio tokenizers let Transformers generate natural speech and clone voices, which brings fraud risks.
- **GPT-4o** made real-time voice conversation natural; **Suno** and **Udio** made full song generation mainstream, and lawsuits turned into licensing deals.

## Sources and Further Reading

- Uriel Singer et al., "Make-A-Video: Text-to-Video Generation without Text-Video Data," Meta, 2022. arxiv.org/abs/2209.14792
- OpenAI, "Video generation models as world simulators," February 2024. openai.com/index/video-generation-models-as-world-simulators
- OpenAI, "Sora 2 is here," 30 September 2025; *Axios*, "OpenAI to discontinue Sora video app," 24 March 2026. axios.com
- Google DeepMind, "Veo 3," May 2025. deepmind.google/models/veo
- Kuaishou, Kling AI. klingai.com; Runway, Gen-4.5. runwayml.com
- Google DeepMind, "Genie 3: A new frontier for world models," August 2025. deepmind.google
- Alec Radford et al., "Robust Speech Recognition via Large-Scale Weak Supervision" (Whisper), 2022. arxiv.org/abs/2212.04356
- Aäron van den Oord et al., "WaveNet: A Generative Model for Raw Audio," DeepMind, 2016. arxiv.org/abs/1609.03499
- Chengyi Wang et al., "Neural Codec Language Models are Zero-Shot Text to Speech Synthesizers" (VALL-E), Microsoft, 2023. arxiv.org/abs/2301.02111
- OpenAI, "Hello GPT-4o," 13 May 2024 (232 ms minimum, 320 ms average audio response). openai.com/index/hello-gpt-4o
- US Federal Communications Commission, ruling on AI-generated voices in robocalls, February 2024, following the New Hampshire robocalls of January 2024.
- Prafulla Dhariwal et al., "Jukebox: A Generative Model for Music," OpenAI, 2020. arxiv.org/abs/2005.00341; Andrea Agostinelli et al., "MusicLM: Generating Music From Text," Google, 2023. arxiv.org/abs/2301.11325
- RIAA, lawsuits against Suno and Udio, 24 June 2024; Bloomberg Law, "Warner Music Settles Lawsuit with AI Music Startup Suno," November 2025; Universal Music Group and Udio settlement announcement, October 2025.
