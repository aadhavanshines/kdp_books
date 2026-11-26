# Chapter 21: Build Useful Tools Without Code

In Chapter 8 you built a tip calculator in one request. This chapter gives you eight more tools that people actually keep using. Each one is an artifact: you describe it, Claude builds it, and you can use it, change it, share it, or install it as an app on your computer.

**The recipe for every tool:** say who uses it, what they type or tap, what they should see, and one or two rules for how it should look. Then test it like a real user and ask for fixes.

## Workflow 39: A Habit Tracker

```prompt
Build a habit tracker I can use every day. I want to track 5 habits I can rename (start with: walk 30 min, read 20 pages, no phone after 10pm, drink 8 glasses of water, stretch). Show this month as a grid I can tap to tick. Show my current streak for each habit and a percentage for the month. Remember my ticks between visits. Clean, calm design, big tap targets for a phone.
```

**Test it:** tick a few days, close it, reopen it. Do your ticks stay? **Ask next:** "Add a note field for each day" or "Add a weekly view."

## Workflow 40: A Family Chore Chart with Points

```prompt
Make a chore chart for our two kids, Maya (9) and Leo (6). Chores: make bed (1 point), set table (2), feed the cat (2), tidy toys (1), help with laundry (3). Each kid has a column; tap a chore to give points. Show a weekly total and a progress bar toward a reward at 30 points. Big, colorful and easy for a 6-year-old to read. A "new week" button resets the points.
```

**Tip:** Install it as an app on the family computer (Chapter 8) so the kids can open it themselves.

## Workflow 41: A Party Quiz Game

```prompt
Make a trivia game for our family holiday party: 4 rounds (movies, music, geography, family history) of 5 questions each, multiple choice, playable on a TV screen from a laptop. Two teams take turns; show the score at the top. Big text, fun reveal animation for the right answer. For the family history round, use these facts: [add 5 facts about your family].
```

**Why it's a hit:** the family-history round is impossible to buy in a shop. Five real facts make the whole game personal.

## Workflow 42: A One-Page Event Website

```prompt
Make a simple one-page website for our neighborhood's summer block party: Saturday 21 June, 3 to 8pm, Linden Street (closed to cars). Sections: what's happening (bouncy castle, potluck, live band at 6pm), what to bring, a map description, a FAQ (pets, parking, rain plan) and a contact email. Bright summer colors, readable on a phone.
```

Share it with the **Share** button (Chapter 8) and send the link to the neighborhood group. **Check First:** Don't put home addresses or phone numbers on a public page; use a group email instead.

## Workflow 43: A Loan or Mortgage Calculator That Shows the Real Cost

```prompt
Build a loan calculator: I enter the amount, the interest rate and the term in years. Show the monthly payment, the total interest paid, and a chart of how much of each year's payments goes to interest versus the loan. Add a box for "extra payment per month" that shows how many months and how much interest it saves. Explain each number in one plain sentence underneath.
```

**Check it:** Try one example you can verify with your bank's calculator. If the numbers differ, tell Claude both results and ask it to find out why. **Remember:** this helps you understand options; your lender's official figures are the ones that count.

## Workflow 44: An Interactive Chart from Your Spreadsheet

```prompt
Here's our small bakery's sales by month for 2025 and 2026, by product. Make an interactive chart: I can pick a product and see both years side by side, hover for exact numbers, and see the growth percentage. Below it, a short table of the three best and three worst months.
```

This turns a spreadsheet you'd never look at into something you'll actually understand in seconds. **Ask next:** "Add a button to download the chart as an image for our newsletter."

## Workflow 45: A Reading Log or Collection Tracker

```prompt
Build a reading log. I add a book with title, author, date finished, a 1 to 5 star rating and a one-line note. Show my books as cards with the newest first, a counter for books this year against a goal of 24, and a search box. Remember everything between visits. Let me export my list as a spreadsheet.
```

Swap "book" for wine, plants, recipes, records, board games or hikes, and you have a tracker for any hobby.

## Workflow 46: A Printable Weekly Planner

```prompt
Design a printable weekly planner page as a PDF, US Letter size: the week's dates across the top (Monday start), a box for each day with lines, a top-3 priorities box, a small habit-tick row, and a notes area. Minimal black-and-white design so it prints well on a home printer. Make 4 weeks starting Monday 5 January 2027.
```

**Ask next:** "Add our family birthdays in January in small text on the right days."

## When a Tool Doesn't Work

Sometimes a tool has a bug: a button does nothing, a number is wrong, the layout breaks on a phone. Don't try to fix it yourself. Tell Claude exactly what you did and what happened:

```prompt
When I tap "new week," Leo's points reset but Maya's don't. Please fix it, and check the other buttons for the same problem.
```

Describing what you tapped and what you expected is all Claude needs. You never need to look at the code.
