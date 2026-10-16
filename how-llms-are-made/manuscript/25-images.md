# Chapter 25: Making Pictures: From GANs to Diffusion

Type "a red fox reading a newspaper in a Paris café, watercolor" and, seconds later, a picture appears that never existed before. Image generators are close cousins of language models: they share the Transformer, embeddings, enormous training datasets and many of the same researchers. But the core trick they use to create images, called **diffusion**, is quite different from predicting the next word. This chapter tells the story of AI image generation, from blurry faces in 2014 to photorealistic, editable images today.

## GANs: The Forger and the Detective

In 2014, **Ian Goodfellow**, then a PhD student at the University of Montreal, had an idea during a discussion with friends at a bar: pit two neural networks against each other. One, the **generator**, tries to create fake images. The other, the **discriminator**, tries to tell the fakes from real photos. As the detective gets better at spotting fakes, the forger must get better at making them. He reportedly went home and coded it that night, and it worked on the first try.

These **generative adversarial networks (GANs)** dominated image generation for years. NVIDIA's **StyleGAN** (2018 and 2019) produced faces so realistic that the website *This Person Does Not Exist* (2019), which showed a new, fake face on every refresh, startled millions of visitors.

> **Did You Know?** In October 2018, the auction house Christie's sold a GAN-generated portrait, *Edmond de Belamy*, printed on canvas and signed with a piece of the algorithm's math formula, for $432,500, more than forty times its high estimate. It was made by a French art collective called Obvious, using code largely written by others, which sparked one of the first debates about who deserves credit for AI art.

But GANs were hard to train, and good at only a narrow kind of image at a time, such as faces or bedrooms. Making *anything* from a text description needed a new approach.

## Diffusion: Creating by Removing Noise

The breakthrough idea is counterintuitive. Take a photo and gradually add random noise to it, step by step, until it's pure static, like an old television with no signal. That's easy. Now train a neural network to do the reverse: given a slightly noisy image, predict the noise, so it can be removed, taking one small step back towards a clean image.

Once trained, the network can start from **pure random noise** and, step by step, remove "noise" until a brand-new image emerges. It's like a sculptor who sees a statue in a block of marble and chips away everything that isn't the statue.

![Diffusion: training adds noise to real images step by step until only static remains, and teaches a network to reverse each step. To generate, the network starts from pure noise and removes it gradually, guided by the text prompt, until a new image appears.](images/diagram-diffusion.png)

The idea came from **Jascha Sohl-Dickstein** and colleagues in 2015, inspired by physics, and was made practical in 2020 by **Jonathan Ho**, **Ajay Jain** and **Pieter Abbeel** at UC Berkeley. In 2021, **Prafulla Dhariwal** and **Alex Nichol** at OpenAI showed that diffusion models could beat GANs on image quality.

> **In Plain Words:** A diffusion model is trained to clean up noisy pictures. Ask it to clean up pure noise, while telling it what the picture should show, and it "cleans" its way to a brand-new image.

## Steering With Words

To follow a text prompt, the network gets the prompt's embedding as an extra input at each denoising step, using text encoders like CLIP's (Chapter 24). A technique called **classifier-free guidance** makes it follow the prompt more strictly by comparing what it would draw with and without the prompt, and exaggerating the difference.

Doing all this on full-size images is very slow. In 2021, **Robin Rombach**, **Andreas Blattmann**, **Björn Ommer** and colleagues in Heidelberg and Munich proposed **latent diffusion**: first compress images into a much smaller "latent" representation, run diffusion there, and decompress at the end. It made high-quality image generation fast enough to run on a gaming PC.

## The Explosion of 2022

- **DALL·E** (OpenAI, January 2021), named after the artist Salvador Dalí and Pixar's robot WALL·E, generated images from text using a GPT-like approach; **DALL·E 2** (April 2022) switched to diffusion and dazzled the public.
- **Midjourney**, a small independent lab founded by **David Holz**, opened to the public in July 2022, through the chat app Discord, and became famous for its artistic style.
- **Stable Diffusion** (August 2022), built on latent diffusion by Stability AI, the Munich research group and Runway, was released openly. Anyone could run it on their own computer, and a huge community of tools, fine-tunes and plug-ins grew around it.

> **Did You Know?** In August 2022, Jason Allen won first prize in the digital art category of the Colorado State Fair with *Théâtre D'opéra Spatial*, an image he made with Midjourney and then refined. When he revealed how it was made, it set off a fierce debate among artists. The US Copyright Office later refused to register the work, ruling that the AI-generated parts lacked human authorship.

## Better Control, Better Images

Early generators were notoriously bad at hands, which often had six or seven fingers, and at writing text in images, which came out as gibberish. Successive generations fixed much of this, with larger models, better data and new designs:

- **ControlNet** (2023), by **Lvmin Zhang** and colleagues at Stanford, let users guide images with sketches, poses or outlines.
- **Diffusion Transformers** (DiT), by **William Peebles** and **Saining Xie** (2022), replaced the older U-Net network inside diffusion models with a Transformer, which scaled better and became the standard for images and video (Chapter 26).
- **Flow matching**, a cleaner mathematical relative of diffusion, is used by Stable Diffusion 3 and by **FLUX** (2024), from **Black Forest Labs**, founded by several of Stable Diffusion's original creators.

## Language Models Learn to Draw

In March 2025, OpenAI built image generation directly into GPT-4o. Instead of a separate diffusion model, the multimodal language model itself produced the image, so it understood instructions much better: it could follow detailed prompts, render readable text, and edit images through conversation. Within days, social media was flooded with photos redrawn in the style of Studio Ghibli, and Sam Altman wrote that OpenAI's GPUs were "melting".

Google's **Gemini 2.5 Flash Image**, nicknamed **"Nano Banana"** (August 2025), became famous for editing photos while keeping people's faces consistent, and its successors, Nano Banana Pro and Nano Banana 2, are widely used. As of October 2026, leading image models include OpenAI's **GPT Image 2**, Google's **Nano Banana** family, **Midjourney V8** and **FLUX.2**, with many others, including open ones, close behind. Most combine language-model understanding with diffusion-style or flow-based image generation.

## The Controversies

- **Artists' work.** Image models were trained on billions of images scraped from the web, many of them copyrighted art. Lawsuits followed, including artists' class action *Andersen v. Stability AI* in the US, and Getty Images' suit against Stability AI in the UK, where in November 2025 the High Court largely rejected Getty's main claims. The legal questions remain unsettled, and some artists use tools such as **Glaze** and **Nightshade**, from the University of Chicago, to protect their work.
- **Deepfakes.** Realistic fake images of real people can be used for fraud, harassment and misinformation. Most services block images of real public figures in harmful contexts, and many countries have made non-consensual intimate deepfakes illegal.
- **Labeling.** Google's **SynthID** adds an invisible watermark to images generated by its tools, and the **C2PA** "Content Credentials" standard, backed by Adobe, Microsoft, OpenAI, Google and others, attaches tamper-evident information about how an image was made.

## Key Takeaways

- **GANs** (2014) set a forger against a detective; they made realistic faces but were hard to control.
- **Diffusion** models learn to remove noise, and create images by starting from pure noise; **latent diffusion** made them fast.
- 2022 brought DALL·E 2, Midjourney and the open Stable Diffusion; DiT and flow matching followed.
- Since 2025, multimodal language models generate and edit images directly, with better understanding of instructions and text.
- Copyright, deepfakes and labeling (SynthID, C2PA) are the main controversies.

## Sources and Further Reading

- Ian Goodfellow et al., "Generative Adversarial Networks," 2014. arxiv.org/abs/1406.2661
- Tero Karras, Samuli Laine, Timo Aila, "A Style-Based Generator Architecture for Generative Adversarial Networks" (StyleGAN), NVIDIA, 2018. arxiv.org/abs/1812.04948
- Christie's, "Is artificial intelligence set to become art's next medium?," 2018 (*Edmond de Belamy*, $432,500).
- Jascha Sohl-Dickstein et al., "Deep Unsupervised Learning using Nonequilibrium Thermodynamics," 2015. arxiv.org/abs/1503.03585
- Jonathan Ho, Ajay Jain, Pieter Abbeel, "Denoising Diffusion Probabilistic Models," 2020. arxiv.org/abs/2006.11239
- Prafulla Dhariwal and Alex Nichol, "Diffusion Models Beat GANs on Image Synthesis," 2021. arxiv.org/abs/2105.05233
- Jonathan Ho and Tim Salimans, "Classifier-Free Diffusion Guidance," 2022. arxiv.org/abs/2207.12598
- Robin Rombach et al., "High-Resolution Image Synthesis with Latent Diffusion Models," 2021. arxiv.org/abs/2112.10752
- Aditya Ramesh et al., "Zero-Shot Text-to-Image Generation" (DALL·E), 2021. arxiv.org/abs/2102.12092; "Hierarchical Text-Conditional Image Generation with CLIP Latents" (DALL·E 2), 2022. arxiv.org/abs/2204.06125
- Lvmin Zhang, Anyi Rao, Maneesh Agrawala, "Adding Conditional Control to Text-to-Image Diffusion Models" (ControlNet), 2023. arxiv.org/abs/2302.05543
- William Peebles and Saining Xie, "Scalable Diffusion Models with Transformers," 2022. arxiv.org/abs/2212.09748
- Yaron Lipman et al., "Flow Matching for Generative Modeling," 2022. arxiv.org/abs/2210.02747; Black Forest Labs. bfl.ai
- OpenAI, "Introducing 4o Image Generation," 25 March 2025; Google, "Introducing Gemini 2.5 Flash Image," August 2025.
- US Copyright Office, decision on *Théâtre D'opéra Spatial*, September 2023.
- *Getty Images v. Stability AI*, High Court of England and Wales, judgment of 4 November 2025.
- Coalition for Content Provenance and Authenticity (C2PA). c2pa.org; Google DeepMind, SynthID. deepmind.google
