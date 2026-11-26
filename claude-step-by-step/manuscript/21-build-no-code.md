# Chapter 21: Build Useful Tools Without Code

In Chapter 8 you built a tip calculator in one request. This chapter gives you eight more tools that people actually keep using. Each one is an artifact or a file: you describe it, Claude builds it, and you can use it, change it, share it, or install it as an app on your computer. All eight were built in normal chats, because incognito chats can't save artifacts or files.

**The recipe for every tool:** say who uses it, what they type or tap, what they should see, and one or two rules for how it should look. Then test it like a real user and ask for fixes.

## Workflow 39: A Habit Tracker

```prompt
Build a habit tracker I can use every day. I want to track 5 habits I can rename (start with: walk 30 min, read 20 pages, no phone after 10pm, drink 8 glasses of water, stretch). Show this month as a grid I can tap to tick. Show my current streak for each habit and a percentage for the month. Remember my ticks between visits. Clean, calm design, big tap targets for a phone. Use US spelling.
```

```result
I've built your habit tracker as a page you can open on your phone each day. It starts with your five habits, and the Rename button lets you change any of them.

- Grid: This month is shown one row per day, with one big square per habit. Tap a square to tick it and tap again to untick it. Today's row is highlighted, and you can't tick days that haven't happened yet. The arrows let you look back at earlier months.
- Summary: A card for each habit shows your current streak and your percentage for the month. The percentage only counts days up to today, so you don't start the month looking behind. A streak stays alive until the end of the day even if you haven't ticked today yet.
- Saving: Your ticks are saved to your account, so they'll still be there on your next visit. [...]
```

Two thoughtful details I never asked for: the percentage only counts days so far, and today's streak doesn't "break" before the day is over. **Test it:** tick a few days, close it, reopen it. Do your ticks stay?

## Workflow 40: A Family Chore Chart with Points

```prompt
Make a chore chart for our two kids, Maya (9) and Leo (6). Chores: make bed (1 point), set table (2), feed the cat (2), tidy toys (1), help with laundry (3). Each kid has a column; tap a chore to give points. Show a weekly total and a progress bar toward a reward at 30 points. Big, colorful and easy for a 6-year-old to read. A "new week" button resets the points. Use US spelling.
```

![The real chore chart.](images/shot-w40-chores.png)

```result
I've made Maya and Leo's chore chart and published it as a page. I checked that its code has no syntax errors, but I haven't opened it in a browser or tapped through it, so try a few taps when you first open it.

- Layout: each kid has a column (purple for Maya, teal for Leo) with a big points total. Below that is a progress bar toward 30, a gift box at the end, and a "more to go!" count.
- Chores: each one is a large colored button with a picture and its points [...]. A tap adds the points and floats a "+2" up the screen.
- Reaching 30: confetti falls and that kid's column shows "Reward time!"
- Oops! Undo last: I added this button to each column because little fingers mis-tap. You can drop it if you'd rather not have it.
[...]
```

The "Undo last" button is the kind of thing you only think of after the first tantrum. **Tip:** Install it as an app on the family computer (Chapter 8) so the kids can open it themselves.

## Workflow 41: A Party Quiz Game

```prompt
Make a trivia game for our family holiday party: 4 rounds (movies, music, geography, family history) of 5 questions each, multiple choice, playable on a TV screen from a laptop. Two teams take turns; show the score at the top. Big text, fun reveal animation for the right answer. For the family history round, use these facts: Grandpa Joe was born in 1948 in Duluth, Minnesota; Aunt Rosa ran the Chicago Marathon in 2019; our family dog Biscuit was a beagle; Mom and Dad got married at Lake Tahoe in 1996; cousin Theo has a pet tortoise named Speedy. Use US spelling.
```

```result
Your trivia game is ready. Open it on the laptop, connect the laptop to the TV, and press F for full screen.

How it plays:
- Each team types its name on the start screen.
- The teams take turns, one question each, so each team gets 10 of the 20.
- The scoreboard stays at the top and lights up for whichever team's turn it is.
- To answer, click a choice or press 1-4 or A-D. Press Enter to go to the next question.
- After each answer there's a short pause. Then the right answer grows and glows gold. A correct answer also fires confetti and plays a chime, and the team gets +100. A wrong answer shakes and buzzes. [...]

Family History round: all six of your facts are in. Grandpa Joe's birth year is part of the question about his birthplace, and the wedding year is in the question about where Mom and Dad married. The last geography question is a small hint toward Grandpa Joe's hometown.
```

I gave five facts, not six; a small slip, and harmless here, but a reminder to read Claude's summary against what you actually asked for. The family-history round is the part of this game you can't buy in a shop.

## Workflow 42: A One-Page Event Website

```prompt
Make a simple one-page website for our neighborhood's summer block party: Saturday 19 June 2027, 3 to 8pm, Linden Street in Madison, Wisconsin (closed to cars). Sections: what's happening (bouncy castle, potluck, live band at 6pm), what to bring, a map description, a FAQ (pets, parking, rain plan) and a contact email (lindenstreetparty@example.com). Bright summer colors, readable on a phone.
```

Claude built this one with **Claude Design**, which opens the page on a design canvas where you can keep editing it:

![The real page on the Claude Design canvas.](images/shot-w42-design.png)

1. **The page**, shown small on the canvas. Click to zoom in or preview it.
2. **Editing tools** and **Ask Claude**, for changing anything on the page.

```result
I've built the block party page with all the sections you asked for. It's private until you share it.

The look is sunny yellow, coral and teal with big, rounded headings. On a phone, the cards and the street layout stack into a single column. The FAQ answers open with a tap, and the contact button opens an email to lindenstreetparty@example.com.

Things to check before you share it:
- Text to fill in: I left a few marked spots like [CROSS STREET], [RAIN DATE] and the restroom [LOCATION]. They're for details I didn't have.
- Street layout: the "Where it is" diagram puts the bouncy castle at one end, the potluck tables in the middle and the band at the other end. That's my guess, so move things around if your plan is different.
- Wording I made up: these are my suggestions, so change any that don't match what the organisers decided: leashed dogs are welcome; people park on nearby streets [...]
```

Claude marked what it didn't know instead of inventing it. **Check First:** Don't put home addresses or phone numbers on a public page; use a group email instead.

## Workflow 43: A Loan Calculator That Shows the Real Cost

```prompt
Build a loan calculator in US dollars: I enter the amount, the interest rate and the term in years. Show the monthly payment, the total interest paid, and a chart of how much of each year's payments goes to interest versus the loan. Add a box for "extra payment per month" that shows how many months and how much interest it saves. Explain each number in one plain sentence underneath. Start it with a $25,000 loan at 7.5% for 5 years.
```

![The real loan calculator.](images/shot-w43-loan.png)

```result
For that loan:
- Monthly payment: $500.95, paid for 60 months.
- Total interest: $5,056.92, so you pay $30,056.92 in all.
- Chart: in year 1, about 29% of what you pay goes to interest. By year 5 that drops to about 4%, because interest is charged on a smaller balance each year.
- Extra payment: this box starts at $0. As an example, an extra $100 a month pays the loan off in 49 months instead of 60, which is 11 months sooner and saves $1,013.61 in interest.
```

I checked every number with my own calculation: all four are exactly right. **Remember:** this helps you understand options; your lender's official figures are the ones that count.

## Workflow 44: An Interactive Chart from Your Spreadsheet

I attached a CSV of a bakery's monthly sales and sent:

```prompt
Here's our small bakery's sales by month for 2025 and 2026, by product, in US dollars. Make an interactive chart: I can pick a product and see both years side by side, hover for exact numbers, and see the growth percentage. Below it, a short table of the three best and three worst months.
```

![The real interactive sales chart.](images/shot-w44-sales.png)

```result
I've built your sales chart as a page. Across all products, sales went from $166,212 in 2025 to $182,420 in 2026, up 9.8%. Cakes and coffee grew fastest (+10.2% each), and bread and pastries grew +9.3%.

- Product picker: choose All products, Bread, Pastries, Cakes or Coffee. The chart, the yearly totals and the growth figure all change to match. I added "All products", which adds the four together.
- Chart: for each month, the 2025 bar sits beside the 2026 bar. Hover over or tap a month to see the exact dollar amounts and its growth. [...]
- Best and worst months: two short tables with the top three and bottom three of all 24 months for the chosen product. [...]

Anyone you share the page with can also download the full sales file from it. [...]
```

The yearly totals match the spreadsheet exactly. Note the privacy warning in the last line: sharing the page shares the data too.

## Workflow 45: A Reading Log or Collection Tracker

```prompt
Build a reading log. I add a book with title, author, date finished, a 1 to 5 star rating and a one-line note. Show my books as cards with the newest first, a counter for books this year against a goal of 24, and a search box. Remember everything between visits. Let me export my list as a spreadsheet. Use US spelling.
```

```result
Your reading log page is ready. It's saved to your account, so your books will still be there on any device where you're signed in to Claude. The list is private to you, even if you share the page later.

- Adding a book: enter the title, author, date finished, a rating (click the stars) and a one-line note. The date is set to today to start with.
- Cards: your most recently finished book is always first, and each card has a Delete button that asks you to confirm.
- Yearly goal: the counter at the top shows how many books you've finished this year out of 24, with a progress bar. It counts by the date you finished each book.
- Search: finds matches in the title, author or note as you type.
- Export: the "Export to spreadsheet" button downloads an Excel file (.xlsx) with all your books, newest first.
```

Swap "book" for wine, plants, recipes, records or hikes, and you have a tracker for any hobby.

## Workflow 46: A Printable Weekly Planner

```prompt
Design a printable weekly planner page as a PDF, US Letter size: the week's dates across the top (Monday start), a box for each day with lines, a top-3 priorities box, a small habit-tick row, and a notes area. Minimal black-and-white design so it prints well on a home printer. Make 4 weeks starting Monday 4 January 2027.
```

Partway through, Claude looked at its own first draft, said "Character spacing from the title leaks into the date range (it runs off the page). Fixing that and darkening the notes dots so they show up on a home printer," and fixed both. The result:

![The real four-page PDF planner.](images/shot-w46-planner.png)

```result
I've made your planner: Weekly_Planner_Jan_2027.pdf has four US Letter pages, one for each week from Monday 4 January to Sunday 31 January 2027. [...]

It's black, white and grey only, with no filled areas, so it won't use much ink. The 0.5-inch margins sit inside what home printers can print. Print it at "Actual size" rather than "Fit to page" so the boxes keep their spacing.
```

## When a Tool Doesn't Work

Several of these answers ended with the same honest note: Claude had checked the code but hadn't clicked through the tool itself. So test it. If a button does nothing or a number looks wrong, tell Claude exactly what you did and what happened:

```prompt
When I tap "new week," Leo's points reset but Maya's don't. Please fix it, and check the other buttons for the same problem.
```

Describing what you tapped and what you expected is all Claude needs. You never need to look at the code.
