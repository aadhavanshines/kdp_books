from draw import *

CATEGORY = "Birds and Bugs"

SUBJECTS = [
    dict(name="Owl", steps=[
        [e(100, 108, 44, 58, fill="white")],
        behind(*sym(p("M64 74 L58 40 L90 58 Z", fill="white"))),
        sym(c(82, 92, 17, fill="white")) + front(*sym(eye(84, 94, 7)), z=1),
        [front(p("M93 106 L107 106 L100 118 Z", fill="white"))[0],
         p("M84 136 L89 142 L94 136"), p("M106 136 L111 142 L116 136"), p("M95 150 L100 156 L105 150")],
        sym(p("M62 100 Q78 128 66 152")),
        behind(r(28, 164, 144, 12, 6, fill="white")) + sym(p("M84 162 L82 170 M90 163 L90 172 M96 162 L98 170")),
    ]),
    dict(name="Penguin", steps=[
        [e(100, 106, 44, 60, fill="white")],
        [p("M70 94 Q70 62 100 68 Q130 62 130 94 Q140 150 100 160 Q60 150 70 94 Z")],
        sym(eye(88, 86)) + [front(p("M92 98 L108 98 L100 108 Z", fill="white"))[0]] + sym(e(78, 102, 5, 3)),
        behind(*sym(p("M60 98 Q34 122 48 140 Q58 130 62 120 Z", fill="white"))),
        behind(*sym(e(84, 166, 15, 6, fill="white"))),
    ]),
    dict(name="Parrot", steps=[
        [c(92, 64, 26, fill="white")],
        behind(p("M72 76 Q60 120 84 150 Q100 162 116 146 Q130 110 112 80 Z", fill="white")),
        [front(p("M70 56 Q48 56 50 80 Q60 72 72 76 Z", fill="white"))[0], c(96, 58, 10), eye(97, 58, 5)],
        [front(p("M102 92 Q132 108 118 148 Q104 132 102 92 Z", fill="white"))[0], l(108, 112, 120, 124)],
        behind(p("M94 150 L86 188 L104 184 L114 148 Z", fill="white"), z=-2),
        front(r(36, 154, 128, 11, 5, fill="white")) + [p("M88 146 L88 156"), p("M100 148 L100 156")],
    ]),
    dict(name="Flamingo", steps=[
        [e(114, 96, 36, 24, fill="white")],
        behind(p("M86 98 Q54 86 64 62 Q74 46 64 38 L76 34 Q90 50 78 66 Q70 82 96 86 Z", fill="white")),
        [front(c(66, 34, 12, fill="white"))[0], front(eye(68, 31, 3.2), z=2)[0],
         front(p("M55 32 L42 36 Q42 48 50 52 L54 40 Z", fill="ink"), z=2)[0]],
        [p("M104 90 Q124 80 142 96 Q126 108 104 102 Z"), p("M148 92 L162 86 L156 100")],
        behind(l(112, 118, 112, 184), p("M120 118 L126 142 L108 150"), p("M112 184 L100 186 M112 184 L124 186")),
    ]),
    dict(name="Bee", steps=[
        [e(106, 112, 42, 30, fill="white")],
        [p("M98 84 Q90 112 98 140"), p("M120 86 Q112 112 120 138"),
         behind(p("M146 108 L162 112 L146 118 Z", fill="ink"))[0]],
        [front(c(64, 104, 22, fill="white"))[0]],
        behind(e(98, 74, 16, 26, -20, fill="white"), e(124, 76, 14, 22, 20, fill="white")),
        [eye(58, 100), eye(72, 100), p("M58 112 Q65 118 72 112"),
         p("M58 84 Q52 70 46 68"), dot(44, 66, 3.5), p("M70 83 Q70 68 76 64"), dot(77, 62, 3.5)],
        [dot(172, 62, 2.2), dot(178, 48, 2.2), dot(172, 34, 2.2)],
    ]),
    dict(name="Butterfly", steps=[
        front(e(100, 106, 8, 36, fill="white")),
        behind(*sym(p("M94 96 Q70 46 40 60 Q28 88 62 108 Q80 112 94 104 Z", fill="white"))),
        behind(*sym(p("M94 112 Q62 112 56 140 Q62 162 86 150 Q96 134 96 120 Z", fill="white")), z=-2),
        sym(c(62, 80, 9), c(74, 138, 6), c(52, 96, 4)),
        front(c(100, 64, 10, fill="white")) + sym(p("M96 56 Q90 42 82 38"), dot(81, 37, 3.2)),
    ]),
    dict(name="Ladybug", steps=[
        [c(100, 112, 46, fill="white")],
        behind(c(100, 70, 24, fill="ink")) + sym(c(91, 58, 4, fill="white", w=0.1)),
        [l(100, 66, 100, 158)],
        sym(c(78, 98, 8, fill="ink"), c(80, 132, 7, fill="ink"), c(66, 118, 4, fill="ink")),
        behind(*sym(l(56, 100, 40, 92), l(54, 120, 36, 122), l(60, 142, 46, 154))) +
        sym(p("M92 48 Q86 36 80 34"), dot(79, 33, 3.2)),
    ]),
    dict(name="Snail", steps=[
        [c(112, 96, 40, fill="white")],
        [p("M112 96 Q120 96 120 88 Q120 76 106 78 Q92 82 94 98 Q98 118 118 116 Q138 112 138 92 Q136 66 110 64")],
        behind(p("M40 144 Q56 132 150 130 Q172 132 170 144 Z", fill="white")) +
        behind(p("M60 138 Q46 120 52 96 Q58 78 72 80 Q86 84 84 104 L82 132 Z", fill="white"), z=-0.5),
        [eye(62, 98, 4), eye(76, 98, 4), p("M62 112 Q69 118 76 112"),
         p("M62 84 L54 62"), dot(53, 60, 4), p("M74 82 L78 60"), dot(78, 58, 4)],
        [p("M20 150 Q60 146 100 150 Q140 154 180 150")],
    ]),
    dict(name="Caterpillar", steps=[
        [c(52, 92, 22, fill="white")],
        behind(c(84, 112, 18, fill="white")) + behind(c(114, 118, 18, fill="white"), z=-2) +
        behind(c(144, 112, 18, fill="white"), z=-3) + behind(c(170, 100, 15, fill="white"), z=-4),
        [eye(45, 88), eye(60, 88), p("M46 101 Q53 107 60 101")],
        [p("M44 72 Q40 58 32 56"), dot(31, 55, 3), p("M58 71 Q60 56 68 52"), dot(69, 51, 3)],
        behind(l(78, 128, 76, 138), l(90, 128, 92, 138), l(108, 134, 106, 144), l(120, 134, 122, 144),
               l(138, 128, 136, 138), l(150, 128, 152, 138), z=-5),
        [c(84, 106, 3), c(114, 112, 3), c(144, 106, 3), c(170, 96, 2.5)],
    ]),
    dict(name="Spider", steps=[
        [c(100, 112, 30, fill="white")],
        behind(*sym(p("M74 100 Q54 80 40 90"), p("M72 110 Q50 102 34 112"),
                    p("M72 120 Q50 124 38 138"), p("M76 130 Q60 144 52 160"))),
        sym(eye(90, 106, 6)) + [p("M90 122 Q100 130 110 122")],
        [l(100, 82, 100, 16)],
        sym(e(78, 114, 4, 2.5)),
    ]),
]
