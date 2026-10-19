"""21.3 The Missing Ticket: tickets 0..n were issued; one is missing from
the list of n returned tickets. Which one?"""


def missing_ticket(tickets):
    n = len(tickets)
    return n * (n + 1) // 2 - sum(tickets)  # expected total minus actual


def missing_ticket_xor(tickets):
    result = len(tickets)
    for i, t in enumerate(tickets):
        result ^= i ^ t
    return result


def missing_ticket_set(tickets):
    have = set(tickets)
    return next(i for i in range(len(tickets) + 1) if i not in have)


SOLUTIONS = [missing_ticket, missing_ticket_xor, missing_ticket_set]
EXAMPLES = [(([4, 0, 1, 3, 5],), 2), (([0],), 1), (([],), 0)]


def random_case(rng):
    n = rng.randint(0, 15)
    tickets = list(range(n + 1))
    tickets.remove(rng.randint(0, n))
    rng.shuffle(tickets)
    return (tickets,)
