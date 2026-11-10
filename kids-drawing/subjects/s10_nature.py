from draw import *

CATEGORY = "Nature and Weather"

PETALS = [e(*on(100, 76, 27, a), 13, 18, a + 90, fill="white") for a in range(-90, 270, 60)]

SUBJECTS = [
    dict(name="Sun", steps=[
        [c(100, 100, 36, fill="white")],
        [l(*on(100, 100, 46, a), *on(100, 100, 66 if a % 60 == 0 else 58, a)) for a in range(0, 360, 30)],
        sym(eye(88, 94)) + [p("M88 110 Q100 120 112 110")],
        sym(e(78, 108, 6, 3.5)),
    ]),
    dict(name="Rain Cloud", steps=[
        [cloud(100, 76, 54, 30, 9, 0.18, fill="white")],
        [p("M80 76 Q86 82 92 76"), p("M108 76 Q114 82 120 76"), p("M94 90 Q100 94 106 90")],
        [p(f"M{x} {y} Q{x-8} {y+14} {x} {y+18} Q{x+8} {y+14} {x} {y} Z", fill="white")
         for x, y in [(66, 126), (100, 134), (134, 126)]],
        [p(f"M{x} {y} Q{x-6} {y+10} {x} {y+13} Q{x+6} {y+10} {x} {y} Z", fill="white")
         for x, y in [(82, 152), (118, 152)]],
        [e(100, 184, 44, 6)],
    ]),
    dict(name="Rainbow", steps=[
        [arc(100, 140, 72, 72, 180, 360)],
        [arc(100, 140, 58, 58, 180, 360)],
        [arc(100, 140, 44, 44, 180, 360)],
        [arc(100, 140, 30, 30, 180, 360)],
        front(cloud(36, 142, 24, 12, 7, 0.2, fill="white"), cloud(164, 142, 24, 12, 7, 0.2, fill="white")),
        [star(100, 40, 8, 3.2, n=4), star(156, 60, 6, 2.4, n=4)],
    ]),
    dict(name="Flower", steps=[
        [front(c(100, 76, 16, fill="white"))[0]],
        behind(*PETALS),
        behind(l(100, 104, 100, 176), z=-2),
        behind(p("M100 152 Q76 126 62 140 Q80 158 100 152 Z", fill="white"),
               p("M100 136 Q122 112 138 124 Q122 142 100 136 Z", fill="white"), z=-1.5),
        front(eye(94, 74, 3.4), eye(106, 74, 3.4), p("M95 82 Q100 86 105 82"), z=2),
        [p("M50 176 Q100 170 150 176")],
    ]),
    dict(name="Tree", steps=[
        [cloud(100, 72, 48, 42, 9, 0.18, fill="white")],
        behind(p("M88 104 L84 170 L116 170 L112 104 Z", fill="white")),
        [e(100, 136, 6, 9, fill="ink")],
        [c(80, 66, 6), c(118, 56, 6), c(110, 90, 6), c(70, 92, 5)],
        [p("M40 172 Q100 164 160 172"), p("M56 172 L60 162 L64 172"), p("M136 172 L140 162 L144 172")],
    ]),
    dict(name="Cactus", steps=[
        [p("M84 160 L84 62 Q84 42 100 42 Q116 42 116 62 L116 160 Z", fill="white")],
        behind(p("M84 124 L66 124 Q56 124 56 112 L56 90 Q56 82 64 82 Q72 82 72 90 L72 108 L84 108 Z", fill="white"),
               p("M116 104 L134 104 Q144 104 144 92 L144 72 Q144 64 136 64 Q128 64 128 72 L128 88 L116 88 Z", fill="white")),
        front(p("M66 158 L134 158 L126 186 L74 186 Z", fill="white"), r(62, 150, 76, 12, 3, fill="white")),
        [eye(93, 88, 4), eye(107, 88, 4), p("M95 98 Q100 102 105 98")],
        [l(92, 120, 96, 118), l(104, 132, 108, 134), l(62, 100, 66, 98), l(138, 80, 134, 78)],
        [front(cloud(100, 40, 9, 8, 5, 0.3, fill="white"), z=0.5)[0]],
    ]),
    dict(name="Mushroom", steps=[
        [p("M40 100 Q40 40 100 40 Q160 40 160 100 Q100 112 40 100 Z", fill="white")],
        behind(p("M80 104 Q74 150 84 162 L116 162 Q126 150 120 104 Z", fill="white")),
        [c(74, 72, 9), c(112, 56, 7), c(136, 82, 8), c(100, 86, 5)],
        [eye(92, 126, 4), eye(108, 126, 4), p("M95 136 Q100 140 105 136")],
        [l(30, 162, 170, 162), p("M40 162 L46 150 L52 162"), p("M148 162 L154 150 L160 162")],
    ]),
    dict(name="Snowman", steps=[
        [c(100, 146, 34, fill="white")],
        [c(100, 98, 26, fill="white")],
        [front(c(100, 58, 20, fill="white"))[0]],
        front(r(84, 22, 32, 22, 2, fill="white"), l(74, 44, 126, 44), z=2) +
        front(eye(93, 56, 3.4), eye(107, 56, 3.4), p("M100 62 L118 66 L100 68 Z", fill="white"), z=2),
        [dot(100, 92, 3), dot(100, 106, 3), dot(100, 136, 3)] +
        behind(*sym(p("M76 96 L52 80 M60 85 L56 74")), z=-2),
        [p(f"M{x} {y-5} L{x} {y+5} M{x-5} {y} L{x+5} {y}") for x, y in [(36, 50), (164, 70), (40, 120), (164, 130)]],
    ]),
]
