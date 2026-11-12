from draw import *

CATEGORY = "Pets and Farm Friends"

SUBJECTS = [
    dict(name="Cat", steps=[
        [c(100, 78, 42, fill="white")],
        behind(*sym(p("M64 57 L64 22 L88 40 Z", fill="white"))) +
        sym(p("M71 46 L71 33 L80 41")),
        sym(eye(85, 76)) + [p("M95 88 L105 88 L100 94 Z", fill="ink"),
                            p("M90 98 Q95 104 100 96 Q105 104 110 98")] +
        sym(l(52, 86, 72, 89), l(53, 97, 72, 95)),
        behind(p("M74 110 Q58 140 64 174 L136 174 Q142 140 126 110 Z", fill="white")),
        sym(l(88, 140, 88, 174), p("M80 174 Q88 166 96 174")) +
        behind(p("M134 168 Q174 168 166 126 Q162 112 152 120 Q160 150 136 154", fill="white"), z=-2),
        sym(l(92, 40, 94, 50), l(100, 37, 100, 48)),
    ]),
    dict(name="Puppy", steps=[
        [e(100, 80, 40, 36, fill="white")],
        sym(p("M66 61 Q44 62 46 98 Q48 116 60 108 Q62 98 61 88")),
        sym(eye(86, 74)) + [e(100, 96, 17, 12, fill="white"), e(100, 90, 7, 5, fill="ink")],
        [l(100, 95, 100, 101), p("M91 102 Q100 108 109 102"), p("M96 105 Q100 115 104 105")],
        behind(p("M74 106 Q60 140 66 174 L134 174 Q140 140 126 106 Z", fill="white")) +
        sym(l(90, 140, 90, 174), p("M80 174 Q90 165 100 174")),
        behind(p("M133 160 Q160 158 162 132 Q152 132 136 148", fill="white"), z=-2) +
        [e(118, 132, 6, 8), p("M76 112 Q100 124 124 112"), c(100, 124, 5, fill="white")],
    ]),
    dict(name="Bunny", steps=[
        [c(100, 96, 36, fill="white")],
        behind(*sym(e(84, 34, 11, 28, -8, fill="white"))) + sym(e(84, 38, 5, 17, -8)),
        sym(eye(87, 92)) + [p("M96 104 L104 104 L100 109 Z", fill="ink"),
                            p("M100 109 L100 113 M92 113 Q96 118 100 113 Q104 118 108 113")] +
        sym(l(72, 102, 58, 98), l(72, 108, 58, 110)),
        behind(e(100, 156, 30, 26, fill="white")) + sym(e(86, 140, 7, 9, fill="white")),
        behind(*sym(e(80, 180, 13, 6, fill="white")), z=-0.5) + behind(c(132, 168, 9, fill="white"), z=-2),
    ]),
    dict(name="Mouse", steps=[
        [c(100, 102, 32, fill="white")],
        behind(*sym(c(70, 72, 20, fill="white"))) + behind(*sym(c(70, 72, 11)), z=-0.5),
        sym(eye(89, 98)) + [dot(100, 114, 5), p("M94 120 Q100 126 106 120")],
        sym(l(66, 110, 86, 114), l(66, 121, 86, 119)),
        behind(e(100, 160, 26, 24, fill="white")) +
        behind(*sym(e(86, 184, 11, 5, fill="white")), z=-2),
        behind(p("M124 170 Q160 180 158 152 Q156 134 172 130"), z=-2),
    ]),
    dict(name="Goldfish", steps=[
        [e(94, 100, 46, 32, fill="white")],
        behind(p("M134 100 L170 70 Q160 100 170 130 Z", fill="white")),
        behind(p("M68 76 Q88 34 126 78 Z", fill="white"),
               p("M82 124 Q92 156 116 126 Z", fill="white")),
        [eye(70, 94, 6), p("M54 110 Q60 115 66 110"), p("M86 80 Q95 100 86 120")],
        [p("M102 90 Q108 96 102 102"), p("M114 92 Q120 98 114 104"),
         p("M102 106 Q108 112 102 118"), p("M126 98 Q131 104 126 110")],
        [c(40, 72, 6), c(30, 52, 4), c(42, 38, 3)],
    ]),
    dict(name="Cow", steps=[
        [r(64, 58, 72, 82, 30, fill="white")],
        behind(*sym(e(56, 76, 17, 8, -15, fill="white"),
                    p("M80 62 Q66 42 80 34 Q82 46 92 58", fill="white"))),
        [e(100, 124, 34, 22, fill="white", )] + sym(e(88, 124, 4, 6, fill="ink")),
        sym(eye(84, 92)) + [p("M90 134 Q100 140 110 134")],
        [p("M66 80 Q70 66 86 70 Q92 82 80 90 Q68 92 66 80 Z"), p("M92 60 Q96 50 100 58 Q104 50 108 60")],
        behind(p("M88 144 L112 144 L116 162 L84 162 Z", fill="white")) + [c(100, 156, 3.5, fill="ink")],
    ]),
    dict(name="Pig", steps=[
        [c(100, 96, 44, fill="white")],
        behind(*sym(p("M64 72 Q50 40 64 38 Q80 42 92 56 Z", fill="white"))),
        [e(100, 108, 20, 14, fill="white")] + sym(e(93, 108, 3, 5, fill="ink")),
        sym(eye(82, 86)) + [p("M88 128 Q100 136 112 128")] + sym(e(68, 110, 7, 4)),
        behind(e(100, 160, 40, 24, fill="white")) +
        behind(*sym(r(70, 170, 14, 14, 4, fill="white")), z=-2),
        behind(p("M138 156 Q156 150 152 140 Q146 132 144 144 Q144 156 160 154"), z=-2),
    ]),
    dict(name="Chick", steps=[
        [c(100, 108, 46, fill="white")],
        behind(*sym(p("M57 100 Q34 112 58 132 Z", fill="white"))),
        sym(eye(84, 98)) + [p("M92 110 L108 110 L100 122 Z", fill="white")],
        sym(p("M86 154 L86 170 M78 176 L86 170 L94 176")),
        [p("M98 62 Q90 46 100 44"), p("M102 62 Q110 48 116 54")] + sym(e(70, 114, 7, 4)),
    ]),
    dict(name="Sheep", steps=[
        [cloud(104, 116, 50, 38, 12, 0.18, fill="white")],
        [e(100, 98, 22, 27, fill="white", )],
        behind(*sym(e(72, 90, 13, 6, 20, fill="white")), z=0.5) +
        [{**cloud(100, 72, 19, 9, 6, 0.3, fill="white"), "z": 2}],
        sym(eye(92, 98, 4.5)) + [p("M95 112 Q100 116 105 112")],
        behind(*sym(r(76, 146, 9, 30, 4, fill="white"), r(116, 148, 9, 28, 4, fill="white"))),
    ]),
    dict(name="Duck", steps=[
        [e(106, 128, 52, 32, fill="white")],
        [c(70, 80, 26, fill="white")],
        [{**p("M46 76 Q28 78 28 88 Q40 94 52 90", fill="white"), "z": 2}, eye(74, 74)],
        [p("M96 118 Q120 104 146 120 Q130 142 104 136")],
        behind(p("M154 118 L172 100 L164 128 Z", fill="white")),
        [p("M36 166 Q46 160 56 166 Q66 172 76 166"), p("M110 168 Q120 162 130 168 Q140 174 150 168")],
    ]),
]
