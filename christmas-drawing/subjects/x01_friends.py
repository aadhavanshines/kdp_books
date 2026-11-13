from draw import *

CATEGORY = "Santa and Friends"

SUBJECTS = [
    dict(name="Santa Face", steps=[
        [c(100, 100, 32, fill="white")],
        behind(p("M70 82 Q86 34 104 26 Q118 32 130 82 Z", fill="white")) + [c(104, 26, 8, fill="white")],
        [front(r(62, 74, 76, 16, 8, fill="white"))[0]],
        front(cloud(100, 130, 32, 22, 9, 0.16, fill="white"), z=0.6) +
        front(p("M100 114 Q88 104 76 112 Q88 122 100 116 Q112 122 124 112 Q112 104 100 114 Z", fill="white"), z=2),
        front(*sym(eye(89, 99)), c(100, 108, 5, fill="white"), z=2.5) + front(*sym(e(80, 110, 5, 3)), z=2.4),
    ]),
    dict(name="Santa Claus", steps=[
        [e(100, 126, 38, 40, fill="white")],
        [front(c(100, 62, 20, fill="white"))[0]],
        front(p("M82 50 Q94 18 112 16 Q124 26 118 50 Z", fill="white"), c(112, 16, 6, fill="white"), z=1.5) +
        front(r(78, 44, 44, 10, 5, fill="white"), z=2),
        front(cloud(100, 84, 22, 16, 7, 0.2, fill="white"), z=1.8) + front(*sym(eye(93, 60, 3.5)), z=2.5),
        [r(62, 120, 76, 12), r(92, 118, 16, 16, 2, fill="white")] +
        behind(*sym(e(64, 114, 10, 18, 20, fill="white"), c(58, 130, 7, fill="white"),
                    r(76, 158, 20, 16, 6, fill="ink"))),
    ]),
    dict(name="Elf", steps=[
        [c(100, 94, 26, fill="white")],
        behind(*sym(p("M76 90 L54 76 L74 104 Z", fill="white"))),
        front(p("M72 80 Q84 30 132 24 Q120 46 128 80 Z", fill="white"), c(134, 24, 6, fill="white"), z=1) +
        front(p("M70 82 L78 72 L86 82 L94 72 L102 82 L110 72 L118 82 L126 72 L132 82 L132 88 L70 88 Z", fill="white"), z=2),
        sym(eye(91, 96, 4)) + [p("M92 108 Q100 114 108 108")] + sym(e(80, 104, 4, 2.5)),
        behind(p("M80 118 L66 160 L134 160 L120 118 Z", fill="white")) +
        behind(*sym(l(88, 160, 88, 176), p("M88 176 L72 176 Q66 168 72 164")), z=-2),
    ]),
    dict(name="Reindeer", steps=[
        [e(100, 100, 30, 36, fill="white")],
        [front(e(100, 130, 22, 15, fill="white"))[0], front(e(100, 117, 11, 7.5, fill="ink"), z=2)[0]],
        behind(*sym(e(64, 86, 14, 7, -25, fill="white"))),
        behind(*sym(p("M86 68 L74 38 M79 52 L62 46 M76 44 L80 28", w=1.3))),
        sym(eye(88, 96)) + front(p("M94 134 Q100 138 106 134"), z=2),
    ]),
    dict(name="Snowman", steps=[
        [c(100, 148, 34, fill="white")],
        [front(c(100, 100, 26, fill="white"))[0]],
        [front(c(100, 60, 20, fill="white"), z=2)[0]],
        front(r(84, 22, 32, 22, 2, fill="white"), l(74, 44, 126, 44), z=3) +
        front(eye(93, 58, 3.4), eye(107, 58, 3.4), p("M100 64 L118 68 L100 70 Z", fill="white"), z=3),
        front(p("M78 80 Q100 90 122 80 L122 88 Q100 98 78 88 Z", fill="white"), r(108, 84, 10, 26, 3, fill="white"), z=2.5) +
        [dot(100, 104, 3), dot(100, 118, 3), dot(100, 140, 3)] +
        behind(*sym(p("M76 100 L52 84 M60 89 L56 78")), z=-2),
    ]),
    dict(name="Gingerbread Man", steps=[
        [c(100, 52, 22, fill="white")],
        [front(r(76, 68, 48, 56, 18, fill="white"))[0]],
        behind(*sym(e(68, 88, 22, 12, -10, fill="white"))),
        behind(*sym(e(86, 134, 12, 24, 15, fill="white"))),
        front(*sym(dot(92, 48, 3)), p("M90 58 Q100 66 110 58"), c(100, 84, 4), c(100, 100, 4), c(100, 116, 4), z=2) +
        sym(p("M54 82 Q58 88 54 94"), p("M80 150 Q86 154 92 150")),
    ]),
    dict(name="Penguin", steps=[
        [e(100, 110, 40, 52, fill="white")],
        [p("M72 104 Q72 80 100 84 Q128 80 128 104 Q136 150 100 158 Q64 150 72 104 Z")] +
        sym(eye(90, 96, 4.5)) + [front(p("M93 104 L107 104 L100 112 Z", fill="white"), z=2)[0]],
        front(p("M64 80 Q66 46 100 46 Q134 46 136 80 Z", fill="white"), z=1) +
        front(r(60, 72, 80, 12, 6, fill="white"), c(100, 42, 9, fill="white"), z=1.5),
        front(p("M68 118 Q100 128 132 118 L132 128 Q100 138 68 128 Z", fill="white"), r(112, 124, 10, 24, 3, fill="white"), z=2),
        behind(*sym(p("M62 112 Q38 132 50 148 Q58 138 62 128 Z", fill="white"), e(84, 162, 14, 6, fill="white"))),
    ]),
    dict(name="Polar Bear", steps=[
        [c(100, 80, 34, fill="white")],
        behind(*sym(c(72, 52, 12, fill="white"))) + behind(*sym(c(72, 52, 5)), z=-0.5),
        [e(100, 94, 15, 11, fill="white"), e(100, 89, 6, 4, fill="ink"), p("M100 93 L100 98 M94 100 Q100 104 106 100")],
        sym(eye(86, 76)) + front(p("M70 108 Q100 122 130 108 L130 118 Q100 132 70 118 Z", fill="white"),
                                 r(112, 114, 12, 30, 3, fill="white"), z=1.5),
        behind(e(100, 150, 34, 30, fill="white"), z=-2) +
        behind(*sym(e(80, 176, 14, 7, fill="white"), e(70, 144, 10, 16, 20, fill="white")), z=-1),
    ]),
    dict(name="Holiday Puppy", steps=[
        [e(100, 98, 36, 32, fill="white")],
        behind(*sym(p("M68 82 Q48 84 50 118 Q54 132 66 124 Q68 112 66 100 Z", fill="white"))),
        [e(100, 112, 16, 11, fill="white"), e(100, 106, 6, 4, fill="ink"), p("M92 116 Q100 122 108 116")] + sym(eye(86, 92)),
        front(p("M70 72 Q80 30 128 34 Q150 44 146 70 Z", fill="white"), c(148, 74, 8, fill="white"), z=1) +
        front(r(64, 66, 76, 14, 7, fill="white"), z=1.5),
        behind(p("M74 126 Q100 140 126 126 L126 136 Q100 150 74 136 Z", fill="white"), z=0.5) +
        [front(c(100, 146, 7, fill="white"), z=1)[0], front(l(96, 146, 104, 146), z=1.1)[0]],
    ]),
    dict(name="Angel", steps=[
        [c(100, 60, 18, fill="white")],
        behind(p("M86 74 Q72 128 62 160 Q100 172 138 160 Q128 128 114 74 Z", fill="white")),
        behind(*sym(p("M84 98 Q42 70 38 112 Q48 130 82 120 Z", fill="white")), z=-2),
        [e(100, 36, 16, 5)] + front(p("M92 60 Q95 63 98 60"), p("M102 60 Q105 63 108 60"), p("M95 68 Q100 72 105 68"), z=2),
        [front(star(100, 116, 13, 5.5, fill="white"), z=1)[0]] + sym(p("M88 96 Q92 108 98 114")),
    ]),
]
