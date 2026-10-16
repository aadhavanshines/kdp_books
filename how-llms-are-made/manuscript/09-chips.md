# Part III: The Factory

# Chapter 9: The Chips: GPUs, TPUs and Memory

Chapter 6 ended with a number: training a frontier model takes around 10²⁵ arithmetic operations or more. No ordinary computer could do that in a human lifetime. This chapter is about the special chips that can do it in months, and about the remarkable, fragile chain of factories and machines that makes them.

## Why Not an Ordinary Processor?

The processor in your laptop, the **CPU**, is a brilliant generalist. It has a handful of powerful cores, each able to run complicated, unpredictable programs very quickly, one step after another.

A language model doesn't need that. Almost all of its work is one simple operation repeated on an unimaginable scale: multiply lots of numbers together and add up the results. These multiplications don't depend on each other, so they can all be done at the same time. What the job needs is not a few brilliant workers but an army of simple ones working in parallel.

> **In Plain Words:** A CPU is like a few expert chefs who can cook anything. An AI chip is like a stadium full of people who can each only chop onions, but who all chop at once. For a mountain of onions, the stadium wins.

## The Graphics Card That Changed Everything

That army already existed, in an unexpected place: video games. To draw a game scene, a computer must calculate the color of millions of pixels, many times a second, and each pixel's calculation is independent. So companies such as **NVIDIA**, founded in 1993 by **Jensen Huang**, **Chris Malachowsky** and **Curtis Priem**, built **graphics processing units (GPUs)**: chips with thousands of small cores designed to do the same arithmetic on lots of data simultaneously.

In 2006, NVIDIA released **CUDA**, a way for programmers to use GPUs for general calculations, not just graphics. Scientists started using gaming cards for physics simulations and, eventually, for neural networks.

> **Did You Know?** The deep-learning revolution began on two gaming cards. In 2012, Alex Krizhevsky, a student of Geoffrey Hinton's, trained AlexNet, the image-recognition network that stunned the AI world, on two NVIDIA GTX 580 graphics cards with 3 GB of memory each, over five or six days, at his parents' house in Toronto. Jensen Huang has often told the story as the moment NVIDIA realized that AI was its future.

## Inside a Modern AI Chip

Today's AI chips are far removed from gaming cards. NVIDIA's **H100**, the workhorse of the 2023-2025 AI boom, gives an idea of the scale:

- **80 billion transistors**, the tiny switches that do the computing, packed onto a piece of silicon about the size of a postage stamp.
- About **2,000 trillion operations per second** on the 8-bit numbers used in AI work, from thousands of cores and special "tensor cores" built just for multiplying grids of numbers.
- **80 GB of memory** right next to the chip, able to deliver 3.35 terabytes per second: the equivalent of about 700 DVDs every second.
- Up to **700 watts** of power, as much as a microwave oven, from a single chip.

The tensor cores were a key turn. Starting in 2017, NVIDIA added circuits dedicated to the exact calculation neural networks need. Each generation since has added more of them and support for **smaller numbers**.

## Smaller Numbers, Faster Chips

A surprising discovery helped speed up AI enormously: neural networks don't need very precise numbers. Scientific computing traditionally uses 64-bit or 32-bit numbers, with many digits of precision. AI training moved to 16-bit numbers around 2017 to 2018, and then to 8-bit numbers. NVIDIA's Blackwell chips (2024) support 4-bit numbers for some work.

Halving the size of each number roughly doubles how many calculations a chip can do, and halves the memory needed. It's like doing rough mental arithmetic instead of working to ten decimal places. For predicting the next word, the rough answer is good enough, and it is vastly faster.

## The Memory Wall

The most important fact about AI chips is one most people never hear: **the arithmetic is no longer the bottleneck. Memory is.**

A chip can only multiply numbers it has in hand. To generate each word, a model must read its parameters from memory. A 70-billion-parameter model at 16 bits is 140 GB, and every word needs a large share of it. Computing power has grown much faster than the speed of memory, so chips often sit idle, waiting for numbers to arrive. Engineers call this the **memory wall**.

The answer is **high-bandwidth memory (HBM)**: memory chips stacked on top of each other like a tiny skyscraper, connected by thousands of vertical wires, and placed right beside the processor on the same package. HBM is so difficult to make that three companies supply nearly all of it: South Korea's **SK hynix** and **Samsung**, and America's **Micron**, with SK hynix the leader through 2025. Each new chip generation is defined as much by its memory as by its processor: NVIDIA's Rubin chips, shipping from late 2026, move to the next generation, **HBM4**.

![Inside an AI chip package: the processor die sits in the middle, surrounded by stacks of high-bandwidth memory. Thousands of short connections between them carry numbers to the processor's tensor cores, because moving data, not arithmetic, is the main bottleneck.](images/diagram-chip.png)

> **In Plain Words:** An AI chip is like a super-fast kitchen with a slow pantry. The cooks are fast; the problem is fetching the ingredients. HBM puts a huge pantry right next to the stove.

## From Chips to Racks

One chip is never enough. Training a frontier model requires thousands, or now hundreds of thousands, of chips working as one machine. They must constantly exchange results, so the connections between chips matter as much as the chips themselves.

NVIDIA's **NVLink** connects chips within a server or rack at very high speed. The **GB200 NVL72**, introduced in 2024, joins 72 Blackwell GPUs and 36 of NVIDIA's own Grace CPUs into a single liquid-cooled rack that behaves like one giant GPU, with 130 terabytes per second of connection bandwidth, and draws around 120 kilowatts: the power of about a hundred homes, in one cabinet. Racks are then linked by high-speed networks of fiber-optic cables.

## Not Only NVIDIA

NVIDIA has dominated AI computing, thanks to its chips and, just as importantly, to CUDA and nearly twenty years of software built on it. But the biggest buyers are making their own chips:

- **Google's TPUs** (Tensor Processing Units) are the longest-running alternative. Google began using them in its data centers in 2015 and revealed them in 2016. Gemini is trained on TPUs. The seventh generation, **Ironwood** (2025), is designed especially for running models; up to 9,216 liquid-cooled chips can be joined into one "pod", each chip with 192 GB of HBM.
- **Amazon** builds **Trainium** chips for training and **Inferentia** for running models; Anthropic trains Claude on large clusters of Trainium as well as on Google TPUs and NVIDIA GPUs.
- **AMD**, NVIDIA's long-time graphics rival, sells the **Instinct** series of AI chips, known for their large memory.
- **Microsoft** (Maia) and **Meta** (MTIA) have designed their own chips.
- Startups have tried radical designs. **Cerebras** builds a single chip from an entire silicon wafer, the size of a dinner plate, with about 4 trillion transistors in its third generation. **Groq** designs chips specialized for generating text very quickly.

## The Most Complicated Machines Ever Built

Almost every advanced AI chip, whoever designs it, is manufactured by one company: **TSMC** (Taiwan Semiconductor Manufacturing Company), founded by **Morris Chang** in 1987. NVIDIA, AMD, Google, Amazon and Apple all design chips; TSMC makes them.

To print features only a few dozen atoms wide, TSMC uses **extreme ultraviolet (EUV) lithography** machines, which are made by exactly one company in the world: **ASML**, in the Netherlands.

> **Did You Know?** An EUV machine makes its light by firing a laser at tiny droplets of molten tin, about 50,000 of them every second, turning each into a plasma hotter than the surface of the Sun. The light it gives off, with a wavelength of 13.5 nanometers, is bounced off some of the smoothest mirrors ever made onto a silicon wafer. The newest "High-NA" model costs around $380 million, weighs about 150 tonnes, and ships in some 250 crates. It took ASML and its partners decades to make the technology work.

This chain, with chips designed in America, made in Taiwan with Dutch machines, and memory from South Korea, is one of the most concentrated and strategically important supply chains in the world. That is why governments have become deeply involved. Since October 2022, the United States has restricted the sale of the most advanced AI chips and chipmaking tools to China. NVIDIA responded by designing slower versions for the Chinese market, such as the H800, which is what DeepSeek used to train its models (Chapter 22). China, in turn, is investing heavily in its own chips, such as Huawei's Ascend series.

## The Price of a Brain

AI chips are expensive. A single H100 sold for around $25,000 to $40,000 at the height of demand, and a full GB200 NVL72 rack costs millions of dollars. A cluster of 100,000 GPUs costs billions before it's even switched on. In 2024 and 2025, NVIDIA briefly became the most valuable company in the world.

And yet chips are only part of the story. To use them, you need a building, enormous amounts of electricity and a way to remove the heat they produce. That is the subject of the next chapter.

## Key Takeaways

- AI work is mostly simple multiplications that can be done in parallel, so it runs on chips with thousands of simple cores: **GPUs**, **TPUs** and other accelerators.
- GPUs came from video games; AlexNet (2012) was trained on two gaming cards, and NVIDIA's CUDA software helped make it the leader in AI.
- Using smaller, less precise numbers (16, 8 and even 4 bits) made AI chips much faster.
- The real bottleneck is **memory**: stacked high-bandwidth memory (HBM) beside the chip feeds the processor.
- Chips are joined into racks and clusters; NVIDIA's GB200 NVL72 combines 72 GPUs in one rack drawing about 120 kW.
- Nearly all advanced chips are made by TSMC using EUV machines made only by ASML, a concentrated supply chain at the center of global politics.

## Sources and Further Reading

- NVIDIA, H100 Tensor Core GPU datasheet (80 billion transistors, 80 GB HBM3, 3.35 TB/s, up to 700 W). nvidia.com/en-us/data-center/h100
- NVIDIA, GB200 NVL72 product page (72 Blackwell GPUs, 36 Grace CPUs, 130 TB/s NVLink). nvidia.com/en-us/data-center/gb200-nvl72
- NVIDIA, "About CUDA" and company history (founded 1993). nvidia.com
- Alex Krizhevsky, Ilya Sutskever, Geoffrey Hinton, "ImageNet Classification with Deep Convolutional Neural Networks," NeurIPS 2012 (trained on two GTX 580 GPUs).
- Norman Jouppi et al., "In-Datacenter Performance Analysis of a Tensor Processing Unit," ISCA 2017. arxiv.org/abs/1704.04760
- Google Cloud, "TPU7x (Ironwood)" documentation, and Google blog, "Ironwood: The first Google TPU for the age of inference," April 2025. cloud.google.com/tpu/docs/tpu7x
- Counterpoint Research, HBM market share estimates, 2025 (SK hynix leading, followed by Samsung and Micron), as reported in the trade press.
- ASML, "EUV lithography systems" (tin-plasma light source, 13.5 nm). asml.com; Tom's Hardware reporting on High-NA EUV pricing and shipping, 2023-2024.
- US Department of Commerce, Bureau of Industry and Security, export controls on advanced computing and semiconductor manufacturing items, 7 October 2022 and later updates.
- Chris Miller, *Chip War: The Fight for the World's Most Critical Technology* (Scribner, 2022), a readable history of the chip industry.
