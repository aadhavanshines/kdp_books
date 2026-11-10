from draw import *

CATEGORY = "Wild Animals"

SUBJECTS = [
    dict(name="Lion", steps=[
        [c(100, 92, 34, fill="white")],
        behind(cloud(100, 92, 50, 50, 12, 0.14, fill="white")),
        behind(*sym(c(74, 64, 10, fill="white")), z=-0.5),
        sym(eye(87, 86)) + [p("M94 100 L106 100 L100 106 Z", fill="ink"),
                            p("M100 106 L100 110 M92 112 Q96 116 100 110 Q104 116 108 112")],
        behind(e(100, 162, 30, 22, fill="white"), z=-2) +
        behind(*sym(e(84, 182, 11, 5, fill="white")), z=-1.5),
        behind(p("M128 168 Q158 172 158 150"), z=-2) +
        behind(cloud(160, 144, 7, 7, 5, 0.3, fill="white"), z=-1.8),
    ]),
    dict(name="Elephant", steps=[
        [c(100, 84, 36, fill="white")],
        behind(*sym(e(56, 84, 26, 32, fill="white"))),
        [front(p("M90 110 Q88 146 110 150 Q124 148 118 138 Q104 142 108 110", fill="white"))[0]],
        sym(eye(86, 80)) + sym(p("M84 112 Q78 124 88 128")),
        behind(r(64, 118, 72, 56, 24, fill="white"), z=-2) +
        sym(l(80, 150, 80, 174), p("M66 174 Q70 168 74 174")),
    ]),
    dict(name="Giraffe", steps=[
        [e(100, 64, 24, 21, fill="white")],
        sym(l(91, 45, 89, 30), dot(89, 28, 4.5)) + behind(*sym(e(70, 56, 12, 6, -20, fill="white"))),
        [front(e(100, 80, 18, 12, fill="white"))[0]] + sym(dot(94, 80, 2)) + sym(eye(90, 60)),
        behind(p("M88 82 L84 172 L116 172 L112 82 Z", fill="white"), z=-2),
        [e(96, 108, 6, 8), e(106, 130, 7, 6), e(94, 152, 6, 7), e(108, 160, 4, 5), e(108, 104, 3, 4)],
    ]),
    dict(name="Monkey", steps=[
        [c(100, 86, 36, fill="white")],
        behind(*sym(c(62, 88, 13, fill="white"))) + behind(*sym(c(62, 88, 6)), z=-0.5),
        [p("M100 74 Q86 60 76 74 Q68 90 80 104 Q100 124 120 104 Q132 90 124 74 Q114 60 100 74 Z")],
        sym(eye(88, 84)) + sym(dot(96, 98, 1.8)) + [p("M88 106 Q100 116 112 106")],
        behind(e(100, 150, 24, 26, fill="white"), z=-2) +
        behind(p("M122 162 Q152 172 150 140 Q150 124 136 128"), z=-2),
        [p("M94 52 Q100 42 106 52")],
    ]),
    dict(name="Bear", steps=[
        [c(100, 86, 38, fill="white")],
        behind(*sym(c(70, 56, 13, fill="white"))) + behind(*sym(c(70, 56, 6)), z=-0.5),
        [e(100, 100, 16, 12, fill="white"), e(100, 95, 6, 4, fill="ink"),
         p("M100 99 L100 104 M94 106 Q100 110 106 106")],
        sym(eye(85, 82)),
        behind(e(100, 152, 32, 30, fill="white"), z=-2) + behind(e(100, 158, 17, 16), z=-1.9),
        behind(*sym(e(70, 144, 10, 17, 25, fill="white"), e(84, 180, 12, 7, fill="white")), z=-1),
    ]),
    dict(name="Fox", steps=[
        [p("M58 70 Q66 120 100 128 Q134 120 142 70 Q100 56 58 70 Z", fill="white")],
        behind(*sym(p("M64 72 L66 30 L92 62 Z", fill="white"))) + sym(p("M71 62 L72 43 L84 58")),
        sym(p("M60 80 Q86 84 95 119")),
        sym(eye(84, 82)) + [e(100, 122, 6, 4, fill="ink")],
        behind(e(102, 158, 28, 24, fill="white"), z=-2) +
        behind(*sym(e(88, 180, 10, 5, fill="white")), z=-1),
        behind(p("M126 168 Q174 172 170 128 Q166 112 152 120 Q156 150 128 148 Z", fill="white"), z=-3) +
        [p("M154 122 Q160 132 168 132")],
    ]),
    dict(name="Panda", steps=[
        [e(100, 88, 40, 36, fill="white")],
        behind(*sym(c(66, 58, 13, fill="ink"))),
        sym(e(83, 86, 10, 13, 30, fill="ink")) + front(*sym(c(84, 84, 3.6, fill="white", w=0.1))),
        [e(100, 104, 6, 4, fill="ink"), p("M100 107 L100 111 M94 113 Q100 117 106 113")],
        behind(e(100, 152, 32, 28, fill="white"), z=-2),
        behind(*sym(e(70, 146, 10, 16, 20, fill="ink"), e(82, 178, 13, 8, fill="ink")), z=-1),
    ]),
    dict(name="Hippo", steps=[
        [e(100, 72, 34, 26, fill="white")],
        [e(100, 110, 42, 28, fill="white")],
        behind(*sym(e(72, 50, 8, 6, fill="white"))) + sym(eye(86, 64)),
        sym(e(84, 102, 4, 6, fill="ink")) + [p("M76 120 Q100 134 124 120")],
        behind(e(100, 158, 38, 22, fill="white"), z=-2) +
        behind(*sym(r(68, 166, 14, 14, 5, fill="white")), z=-1.5),
    ]),
    dict(name="Koala", steps=[
        [e(100, 90, 38, 34, fill="white")],
        behind(*sym(cloud(62, 64, 20, 20, 7, 0.15, fill="white"))) + behind(*sym(c(62, 64, 9)), z=-0.5),
        [e(100, 98, 10, 14, fill="ink")],
        sym(eye(80, 86)) + [p("M94 118 Q100 122 106 118")],
        behind(e(100, 154, 30, 28, fill="white"), z=-2) + behind(e(100, 158, 14, 14), z=-1.9) +
        behind(*sym(e(84, 180, 11, 6, fill="white")), z=-1),
    ]),
    dict(name="Frog", steps=[
        [e(100, 106, 50, 34, fill="white")],
        front(*sym(c(76, 74, 16, fill="white"))),
        front(*sym(eye(76, 74, 7)), z=2),
        [p("M62 108 Q100 136 138 108")] + sym(e(66, 120, 7, 4), dot(94, 98, 1.8)),
        behind(*sym(e(54, 126, 14, 20, -30, fill="white"))) +
        front(*sym(e(78, 140, 14, 6, fill="white"))),
        behind(p("M30 150 Q30 132 100 134 Q170 132 170 150 Q170 166 100 166 Q30 166 30 150 Z"), z=-3),
    ]),
]
