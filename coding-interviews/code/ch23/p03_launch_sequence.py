"""23.3 Launch Sequence Validator: a (fictional) rocket controller moves
through states. Given a list of events, return the final state, or the
index of the first event that is not allowed in the current state.

    IDLE --fuel--> FUELING --arm--> ARMED --ignite--> IGNITION
    IGNITION --release--> LIFTOFF
    any state before LIFTOFF --abort--> SAFED
    SAFED --reset--> IDLE
"""

TRANSITIONS = {
    ("IDLE", "fuel"): "FUELING",
    ("FUELING", "arm"): "ARMED",
    ("ARMED", "ignite"): "IGNITION",
    ("IGNITION", "release"): "LIFTOFF",
    ("SAFED", "reset"): "IDLE",
}
ABORTABLE = {"IDLE", "FUELING", "ARMED", "IGNITION"}


def run_sequence(events):
    state = "IDLE"
    for i, event in enumerate(events):
        if event == "abort" and state in ABORTABLE:
            state = "SAFED"
        elif (state, event) in TRANSITIONS:
            state = TRANSITIONS[(state, event)]
        else:
            return ("invalid", i)
    return ("ok", state)


def run_sequence_if(events):
    state = "IDLE"
    for i, e in enumerate(events):
        if e == "abort" and state != "LIFTOFF" and state != "SAFED":
            state = "SAFED"
        elif state == "IDLE" and e == "fuel":
            state = "FUELING"
        elif state == "FUELING" and e == "arm":
            state = "ARMED"
        elif state == "ARMED" and e == "ignite":
            state = "IGNITION"
        elif state == "IGNITION" and e == "release":
            state = "LIFTOFF"
        elif state == "SAFED" and e == "reset":
            state = "IDLE"
        else:
            return ("invalid", i)
    return ("ok", state)


SOLUTIONS = [run_sequence, run_sequence_if]
EXAMPLES = [
    ((["fuel", "arm", "ignite", "release"],), ("ok", "LIFTOFF")),
    ((["fuel", "ignite"],), ("invalid", 1)),
    ((["fuel", "abort", "reset", "fuel"],), ("ok", "FUELING")),
    ((["fuel", "arm", "ignite", "release", "abort"],), ("invalid", 4)),
    (([],), ("ok", "IDLE")),
]


def random_case(rng):
    names = ["fuel", "arm", "ignite", "release", "abort", "reset"]
    return ([rng.choice(names) for _ in range(rng.randint(0, 8))],)
