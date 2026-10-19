# Chapter 10: AI Factories: Inside the Data Centers

Jensen Huang likes to call them "AI factories": buildings where electricity goes in and intelligence, in the form of tokens, comes out. The name fits. A modern AI data center is an industrial plant, with its own substation, cooling towers or chillers, miles of cable and tens or hundreds of thousands of chips. This chapter walks through one, from the power line to the rack, and looks at the giant new campuses being built for the next generation of models.

## A Walk Through the Building

Imagine following electricity into a large AI data center:

1. **The substation.** High-voltage power arrives from the grid, often through a substation built just for the site, and is stepped down to usable voltages. Backup generators and batteries stand ready in case the grid fails.
2. **The data halls.** Long rooms filled with rows of tall metal cabinets called **racks**. Each rack holds servers packed with AI chips: in the newest designs, 72 GPUs in a single rack.
3. **The network.** Every chip must talk to many others, constantly. Thousands of switches and many thousands of miles of fiber-optic cable link the racks, so that the whole building can act as one computer.
4. **Storage.** Separate systems hold the training data, and regularly save the model's progress, in case something breaks.
5. **Cooling.** Almost all the electricity that goes into a chip comes out as heat, which must be carried away, continuously, or the chips will throttle down or fail.

![Inside an AI data center: electricity flows in from the grid through a substation to rows of racks full of AI chips, linked by a high-speed network. Heat flows out through a liquid cooling loop to cooling towers or dry coolers, which release it to the outside air.](images/diagram-datacenter.png)

## The Heat Problem

Ten years ago, a typical rack of ordinary servers used perhaps 5 to 10 kilowatts, and fans blowing cool air through the room were enough. A rack of NVIDIA's GB200 NVL72 uses about **120 kilowatts**, more than ten times as much, in the same floor space. Air simply can't carry that much heat away.

So AI data centers are switching to **liquid cooling**. In the most common design, called **direct-to-chip** cooling, metal plates sit on top of each chip with coolant flowing through them, like the radiator in a car. The warm liquid flows to heat exchangers, where the heat is passed to a second water loop and finally released outside: in **cooling towers**, which evaporate water (very efficient, but it uses water), or in **dry coolers**, which work like giant radiators (they use little water, but more electricity, especially in hot weather). This trade-off between water and electricity is central to Chapter 11.

A few systems go further, with **immersion cooling**: whole servers dunked in a tank of special non-conducting fluid.

> **In Plain Words:** An AI chip is a very expensive electric heater that happens to do arithmetic. Cooling is half the engineering of a data center.

## Measuring Efficiency

The industry measures how much electricity goes to overhead, such as cooling and power conversion, with a number called **power usage effectiveness (PUE)**: the total energy used by the data center divided by the energy used by the computers themselves. A perfect data center would score 1.0.

Google reports that its fleet averaged a PUE of **1.09** in 2024, meaning only 9% overhead, compared with an industry average of about 1.56. Large, modern facilities designed for AI tend to do much better than older, smaller ones, which is one reason the location and design of new data centers matters so much.

## When Things Break

With tens of thousands of chips, something is always failing. Meta's report on training Llama 3 gives a rare, honest look. During a 54-day period of training on 16,384 GPUs, the job was interrupted **466 times**: 47 were planned, for maintenance, and 419 were unexpected. About 78% of the unexpected ones were caused by confirmed or suspected hardware problems, most often faulty GPUs or their memory. That works out to roughly one failure every three hours.

Despite this, the team kept the chips doing useful training work more than 90% of the time. The trick is **checkpointing**: saving the entire state of the model every so often, so that when a chip fails, the job can restart from the last save on a replacement, losing only a little work. Automatic systems detect the failed part, swap it out and resume, often without a human needing to intervene.

> **Did You Know?** Meta's engineers noticed that the power drawn by their whole cluster swung by tens of megawatts in step with the training process: all 16,000 GPUs would pause together, for example while saving a checkpoint, and then restart together. Swings that large can stress the power grid itself, so AI data centers now have to smooth out their own power use.

## Building at Record Speed

The demand for computing power has turned data center construction into a race.

- In 2024, Elon Musk's xAI built **Colossus**, a cluster of 100,000 NVIDIA H100 GPUs in Memphis, Tennessee, in what Musk said was 122 days, in a converted factory. It was later expanded to around 200,000 GPUs (operating).
- In January 2025, OpenAI, SoftBank, Oracle and the investment firm MGX announced **Stargate**, a plan to invest up to $500 billion in AI infrastructure in the United States. Its first campus, in Abilene, Texas, was planned at about 1.2 gigawatts; by mid-2026, Epoch AI estimated that about half of that was operating, with the rest under construction.
- In July 2025, Mark Zuckerberg announced that Meta was building **Prometheus**, a 1-gigawatt cluster in Ohio due to come online in 2026, and **Hyperion** in Louisiana, under construction and planned to reach 2 gigawatts by 2030 and later 5 gigawatts, with a footprint, he said, that would cover most of Manhattan.
- Microsoft, Google, Amazon and others are building on a similar scale, and new national AI campuses have been announced or planned from the Gulf states to Europe and India.

As of October 2026, these sites range from operating to under construction to merely planned; announced capacities and investment totals are plans, which can be scaled back, as Stargate's Abilene site was from an initial 2 gigawatts.

A **gigawatt** is roughly the output of a large nuclear reactor, or the electricity used by a city of several hundred thousand homes. Just a few years ago, a 30-megawatt data center was considered large. The new campuses are 30 to 150 times bigger.

## Training Across Buildings

As clusters grow beyond what one building, or one local power supply, can hold, labs have begun training single models across several data centers at once, connected by high-speed fiber. Google has described training Gemini across multiple data centers, and the newest campuses are designed as groups of buildings that work as one. The engineering challenge is keeping the chips busy while their results travel between sites: even at the speed of light, distance adds delay.

## The Cost

The scale of investment is unprecedented in the history of technology. In 2025, the four biggest American cloud companies, Microsoft, Alphabet (Google), Amazon and Meta, together planned capital spending of several hundred billion dollars, most of it for AI data centers and the chips inside them. Whether this spending will pay for itself, or whether it's a bubble, is one of the great economic debates of the decade (Chapter 27).

## Key Takeaways

- An AI data center is a factory: power in, computation out, with substations, racks of chips, networks, storage and cooling.
- AI racks use over ten times more power than traditional ones (about 120 kW for a GB200 NVL72), so they need **liquid cooling**.
- Cooling can use water (cooling towers) or more electricity (dry coolers): a key environmental trade-off.
- **PUE** measures overhead; Google reported 1.09 for 2024, versus an industry average of about 1.56.
- Large clusters fail every few hours; **checkpointing** and automatic recovery keep training going.
- New campuses are measured in **gigawatts**: Stargate's Abilene site, Meta's Prometheus and Hyperion, and xAI's Colossus.

## Sources and Further Reading

- Llama Team, Meta, "The Llama 3 Herd of Models," 2024, section 3.3.4 on reliability (466 interruptions in 54 days; power swings). arxiv.org/abs/2407.21783
- NVIDIA, GB200 NVL72 product page. nvidia.com/en-us/data-center/gb200-nvl72
- Google, "Efficiency" (fleet-wide PUE of 1.09 in 2024; industry average 1.56). datacenters.google/efficiency
- The Green Grid, "PUE: A Comprehensive Examination of the Metric," 2012.
- xAI, Colossus announcements (2024); reporting by *The Information*, *Fortune* and others.
- OpenAI, "Announcing The Stargate Project," 21 January 2025. openai.com/index/announcing-the-stargate-project
- Epoch AI, "OpenAI Stargate: where the US sites stand," 2026. epoch.ai/blog/openai-stargate-where-the-us-sites-stand
- Rebecca Szkutak, "Mark Zuckerberg says Meta is building a 5GW AI data center," *TechCrunch*, 14 July 2025.
- Gemini Team, Google, "Gemini: A Family of Highly Capable Multimodal Models," 2023 (training across multiple data centers). arxiv.org/abs/2312.11805
- International Energy Agency, *Energy and AI*, April 2025. iea.org/reports/energy-and-ai
