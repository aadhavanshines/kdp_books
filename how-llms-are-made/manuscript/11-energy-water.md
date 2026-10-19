# Chapter 11: Energy and Water: The Hidden Footprint

Every answer from a chatbot uses a little electricity, and a little water. One answer uses very little. But billions of answers a day, plus the enormous training runs behind them, add up to a footprint that is now visible on national power grids. This chapter looks at the real numbers, explains why different estimates disagree so wildly, and describes what is being done about it. It tries to avoid both the panic and the dismissiveness that this topic often attracts.

## How Much Electricity Does One Question Use?

For years, nobody outside the companies knew. Then, in 2025, two of them published figures:

- **Google** reported in August 2025 that the median text prompt to its Gemini apps used about **0.24 watt-hours** of electricity. Google compared it to watching television for less than nine seconds.
- **OpenAI's** Sam Altman wrote in June 2025 that an average ChatGPT query used about **0.34 watt-hours**, "about what an oven would use in a little over one second".

These are small amounts: a modern LED bulb uses about 0.24 watt-hours in a minute and a half. But the numbers have important caveats. They are averages for typical, short text prompts. A long conversation, a large document, a reasoning model thinking for minutes, or generating an image or video can use many times more. And they're figures published by the companies themselves, without independent auditing.

Google's paper also showed how much the method matters. If it had counted only the AI chips themselves, the figure would have been 0.10 watt-hours. Including the supporting processors and memory, idle machines kept ready for traffic spikes, and the data center's cooling and power losses, raised it 2.4 times, to 0.24.

> **In Plain Words:** One ordinary chatbot question uses roughly as much electricity as a few seconds of television. The concern isn't any one question; it's billions of them a day, plus training, plus heavier uses like reasoning and video.

## How Much Does Training Use?

Training is a one-time cost per model, but a large one:

- **GPT-3** (2020): Google and university researchers estimated its training used about **1,287 megawatt-hours**, about as much as 120 American homes use in a year, emitting about 550 tonnes of CO₂.
- **BLOOM** (2022), trained in France on a supercomputer powered mostly by nuclear energy, emitted about 25 tonnes of CO₂ from the electricity used for its final training run, or about 50 tonnes including the manufacturing of its hardware and idle power. The choice of power grid made a tenfold difference.
- **Llama 3.1 405B** (2024): Meta reported about 31 million GPU-hours and, by its calculation, about 8,900 tonnes of CO₂ based on the local grids' power.

Frontier models in 2025 and 2026 use considerably more. Notice, though, that for a heavily used model, the total footprint can come to be dominated by **using it**, not training it: once hundreds of millions of people use a model every day, the electricity spent on answers can exceed the electricity spent on training. The balance depends on the model's size, the hardware and how much it is used; Mistral's study (below) found training still dominated for its model over 18 months.

## The Big Picture: Data Centers and the Grid

AI is part of a larger story about data centers, which also run websites, video streaming, cloud storage and the rest of the internet.

- The **International Energy Agency** estimated that data centers worldwide used about **415 terawatt-hours** of electricity in 2024, about 1.5% of all the world's electricity. In its central scenario, this more than doubles to about **945 terawatt-hours by 2030**, roughly the current electricity use of Japan, with AI the main driver.
- In the **United States**, the Lawrence Berkeley National Laboratory found that data centers used about **4.4%** of the country's electricity in 2023 (176 terawatt-hours), up from 58 terawatt-hours in 2014, and projected **6.7% to 12%** by 2028.

Globally, data centers remain a small share of electricity compared with industry, buildings or transport. But they're concentrated in particular places. In some regions, such as northern Virginia and Ireland, data centers already use a large share of all electricity, and utilities are struggling to connect new ones fast enough.

The tech companies' own reports show the strain. Google's 2024 environmental report said its emissions had risen 48% since 2019, driven mainly by data center energy, and warned that "reducing emissions may be challenging" as AI grows. Microsoft reported in 2024 that its emissions had risen about 30% since 2020, mainly from building data centers.

## Water: Why Data Centers Drink

Water is the most misunderstood part of the story. Water enters an AI's footprint in three ways:

1. **On-site cooling.** Many data centers use **evaporative cooling**: like sweat cooling your skin, water evaporating in cooling towers carries heat away very efficiently. The evaporated water is gone, at least locally.
2. **Electricity generation.** Most power stations, whether coal, gas or nuclear, themselves use water for cooling. So the electricity a data center uses carries a hidden, **off-site** water footprint. This is often larger than the on-site use.
3. **Making the chips.** Semiconductor factories use large amounts of ultra-pure water to clean wafers.

Two words matter when reading water figures: **withdrawal** is water taken from a river, lake or aquifer, much of which may be returned; **consumption** is water that is lost, mostly by evaporation. Headlines often mix them up.

![Where an AI model's water goes: water evaporates in the data center's cooling towers (on-site), at the power stations that generate its electricity (off-site), and in the factories that make its chips. Most per-prompt estimates differ because they count different parts of this picture.](images/diagram-water.png)

## How Much Water Per Question?

Here, estimates differ by more than a hundred times, which is why the debate is so confusing:

| Estimate | Water per text answer | What it counts |
| --- | --- | --- |
| Google, Gemini apps (2025) | about 0.26 mL (about five drops) | On-site cooling water only, median prompt |
| OpenAI, ChatGPT (2025) | about 0.32 mL (one-fifteenth of a teaspoon) | Not explained |
| Mistral AI, Le Chat (2025) | about 45 mL for a 400-token answer | Full life cycle, including training and hardware |
| Li et al. (2023) | about 500 mL per 10 to 50 answers (10 to 50 mL each) | On-site plus power-station water, GPT-3, varies by place and season |

None of these is "the truth". They count different things: only the cooling water at the data center, or also the water at the power station; only the moment of answering, or a share of training and chip manufacturing; a short prompt, or a longer answer. Location matters enormously too: the same question answered in a cool, wet climate on a grid of wind power uses far less water than in a desert powered by gas.

> **Did You Know?** The 2023 study "Making AI Less Thirsty" by Pengfei Li, Jianyi Yang, Mohammad Islam and Shaolei Ren at the University of California, Riverside, estimated that training GPT-3 in Microsoft's American data centers could have evaporated about 700,000 liters of fresh water directly, and projected that AI could account for 4.2 to 6.6 billion cubic meters of water withdrawal worldwide by 2027. Their phrase "a 500 mL bottle of water for a short conversation" became one of the most quoted statistics about AI, often without the caveats the authors gave.

Mistral AI's 2025 life-cycle study, carried out with the consultancy Carbone 4 and the French environment agency ADEME, was the first full accounting by an AI company. For its Mistral Large 2 model over 18 months, it found about **20,400 tonnes of CO₂** and **281,000 cubic meters of water** in total, and that training and development accounted for about 85% of the emissions and 91% of the water.

### Putting It in Perspective

How big is that? For comparison, 281,000 cubic meters of water is roughly what about a hundred Olympic swimming pools hold. That's real, but agriculture uses vastly more: growing the feed for the beef in a single hamburger is commonly estimated at over a thousand liters of water. Google reported consuming about 6 billion gallons (about 23 million cubic meters) of water across its data centers in 2023, a large number for one company, but a small fraction of a single large farming region.

The real issue is **local**: a data center that evaporates millions of liters a day in a drought-stricken area competes directly with farms and homes for scarce water, whatever the global totals say. Several communities, from Arizona to Chile and Spain, have contested new data centers over water.

## Water Stories From the Real World

Averages hide the most striking facts. Here are some of the best-documented cases.

> **Did You Know?** GPT-4 was trained partly in Iowa, on a Microsoft supercomputer near Des Moines. According to the local water utility, in July 2022, the month before OpenAI finished training GPT-4, Microsoft's Iowa data centers drew about 11.5 million gallons (about 43 million liters) of water, roughly 6% of all the water used in the district, which also supplies the city's drinking water. Most of the year, Iowa is cool enough to use outside air; the water is needed only on hot days, above about 29 °C (85 °F). The utility later said it would only consider future Microsoft data centers that could significantly reduce peak water use.

- **A city's secret.** In The Dalles, Oregon, home to some of Google's oldest data centers, the city fought for 13 months, at Google's request, to keep the company's water use secret, before agreeing in December 2022 to release it. The figure: about 274.5 million gallons (about 1 billion liters) in 2021, more than a quarter of all the water used in the city, nearly triple the amount five years earlier.
- **Company totals.** Microsoft's water consumption jumped 34% from 2021 to 2022, to nearly 1.7 billion gallons (6.4 million cubic meters), enough to fill more than 2,500 Olympic swimming pools, a rise researchers linked largely to AI. Google's data centers consumed about 4.3 billion gallons (16.3 million cubic meters) in 2021, rising to over 6 billion gallons in 2023.
- **One email, one bottle?** In 2024, *The Washington Post*, working with Shaolei Ren's team at the University of California, Riverside, estimated that using GPT-4 to write a single 100-word email could use about 519 milliliters of water, a little more than a standard bottle, once both data center cooling and power-station water were counted, in a typical US location. The estimate went viral. It includes power-station water as well as cooling water, and depends on assumptions about the hardware and location; companies' own per-prompt figures count much less, which is exactly the disagreement shown in the table above.
- **The chip factories.** Before an AI chip ever runs, it must be made. TSMC reported needing about 156,000 tonnes of water a day for its Taiwan factories in 2019, much of it recycled. In 2021, during Taiwan's worst drought in decades, the government cut water to chipmakers, and TSMC hired fleets of tanker trucks to bring water to its factories to keep production running.

> **Did You Know?** Not every data center is thirsty. One built in a cool climate and cooled with outside air, or with closed-loop liquid cooling, may consume almost no water for cooling at all, while one in a hot, dry place using evaporative cooling may consume millions of liters a day. Where an AI model runs can matter more than which model it is.

## What's Being Done

- **Cleaner electricity.** Tech companies are among the world's largest buyers of wind and solar power, and are increasingly turning to nuclear. In September 2024, Microsoft agreed to buy the output of the reactor at Three Mile Island in Pennsylvania for 20 years, enabling Constellation Energy to restart it as the Crane Clean Energy Center. In October 2024, Google ordered small modular reactors from Kairos Power, aiming for 500 megawatts by 2035, and Amazon invested in X-energy. Critics note that many new data centers are, in practice, being powered by new gas plants.
- **Less thirsty cooling.** Closed-loop liquid cooling recirculates the same water instead of evaporating it. Microsoft announced in 2024 that its new data center designs would use no water for cooling, saving an estimated 125 million liters a year per data center, in exchange for slightly more electricity. Others use recycled wastewater or seawater, or build in cooler climates.
- **More efficient models and chips.** Each generation of chips does more work per watt. Smaller, distilled models (Chapter 18) and techniques like mixture of experts use far less energy per answer. Google reported that the energy per median Gemini prompt fell 33 times between May 2024 and May 2025, thanks to better software and hardware.
- **Transparency.** Researchers have called for standard, audited reporting of energy, water and emissions for every model. Mistral's life-cycle study and Google's per-prompt figures were early steps; the European Union's AI Act requires some energy reporting from the largest model providers.

There's also a well-known catch, the **rebound effect**: as AI gets cheaper and more efficient, people use more of it, so total consumption can keep rising even as each answer gets cheaper.

## Key Takeaways

- A typical text prompt uses roughly 0.24 to 0.34 watt-hours, according to Google and OpenAI, a few seconds of TV; reasoning, long documents, images and video use much more.
- Data centers used about 1.5% of world electricity in 2024 (IEA), projected to more than double by 2030; in the US, 4.4% in 2023, possibly 6.7% to 12% by 2028.
- Water is used on-site for cooling, off-site in power stations, and in chip factories. **Withdrawal** is not the same as **consumption**.
- Per-answer water estimates range from a quarter of a milliliter to about 50 milliliters, because they measure different things; local scarcity matters more than global totals.
- Local cases show the stakes: Microsoft's Iowa data centers drew about 6% of a district's water in the month before GPT-4's training finished, and Google's data centers used over a quarter of the water in The Dalles, Oregon.
- Responses include clean power (including nuclear), closed-loop cooling, more efficient chips and models, and better reporting.

## Sources and Further Reading

- Cooper Elsworth et al., "Measuring the environmental impact of delivering AI at Google Scale," Google, August 2025. arxiv.org/abs/2508.15734; Google Cloud blog, "Measuring the environmental impact of AI inference."
- Sam Altman, "The Gentle Singularity," 10 June 2025. blog.samaltman.com/the-gentle-singularity
- David Patterson et al., "Carbon Emissions and Large Neural Network Training," 2021 (GPT-3: 1,287 MWh, 552 tCO₂e). arxiv.org/abs/2104.10350
- Alexandra Sasha Luccioni, Sylvain Viguier, Anne-Laure Ligozat, "Estimating the Carbon Footprint of BLOOM, a 176B Parameter Language Model," *JMLR* 2023. arxiv.org/abs/2211.02001
- Meta, Llama 3.1 model card (training GPU hours and estimated emissions), 2024. github.com/meta-llama/llama-models
- International Energy Agency, *Energy and AI*, April 2025. iea.org/reports/energy-and-ai
- Arman Shehabi et al., *2024 United States Data Center Energy Usage Report*, Lawrence Berkeley National Laboratory, December 2024. eta.lbl.gov
- Pengfei Li, Jianyi Yang, Mohammad A. Islam, Shaolei Ren, "Making AI Less 'Thirsty': Uncovering and Addressing the Secret Water Footprint of AI Models," 2023. arxiv.org/abs/2304.03271
- Mistral AI, "Our contribution to a global environmental standard for AI," July 2025 (with Carbone 4 and ADEME). mistral.ai/news/our-contribution-to-a-global-environmental-standard-for-ai
- Google, *2024 Environmental Report* (emissions up 48% since 2019; water use). sustainability.google/reports
- Microsoft, *2024 Environmental Sustainability Report*; Microsoft, "Sustainable by design: Next-generation datacenters consume zero water for cooling," December 2024. microsoft.com/sustainability
- Matt O'Brien and Hannah Fingerhut, "Artificial intelligence technology behind ChatGPT was built in Iowa — with a lot of water," Associated Press, 9 September 2023 (West Des Moines Water Works figures; Microsoft water use up 34%).
- Mike Rogoway, reporting in *The Oregonian* on Google's water use in The Dalles, 2022; Associated Press, "Oregon city drops fight to keep Google water use private," December 2022.
- Pranshu Verma and Shelly Tan, "A bottle of water per email: the hidden environmental costs of using AI chatbots," *The Washington Post*, 18 September 2024.
- TSMC, Corporate Social Responsibility Report 2019 (daily water use); *Fortune*, "Taiwan's drought is exposing just how much water chipmakers like TSMC use," 12 June 2021.
- Constellation Energy, "Constellation to Launch Crane Clean Energy Center," 20 September 2024; Google, "New nuclear clean energy agreement with Kairos Power," 14 October 2024.
