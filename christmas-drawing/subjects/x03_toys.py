from draw import *

CATEGORY = "Presents and Toys"

SUBJECTS = [
    dict(name="Stack of Presents", steps=[
        [r(48, 112, 104, 64, 3, fill="white")],
        [l(100, 112, 100, 176), l(48, 140, 152, 140)],
        behind(r(70, 64, 60, 48, 3, fill="white"), z=-1),
        behind(l(100, 64, 100, 112), l(70, 86, 130, 86), z=-0.9),
        front(*sym(p("M100 64 Q78 40 76 58 Q78 70 100 64 Z", fill="white")), c(100, 63, 6, fill="white"), z=1) +
        [c(66, 156, 3), c(134, 124, 3), c(82, 126, 3), c(120, 160, 3)],
    ]),
    dict(name="Toy Train", steps=[
        [r(112, 58, 44, 64, 6, fill="white")],
        [front(r(106, 50, 56, 12, 4, fill="white"))[0], r(124, 70, 22, 20, 4)],
        behind(r(44, 82, 70, 40, 12, fill="white")) + behind(r(56, 56, 16, 28, 3, fill="white"), r(50, 48, 28, 10, 3, fill="white"), z=-2),
        front(c(62, 132, 13, fill="white"), c(96, 132, 13, fill="white"), c(136, 128, 17, fill="white"), z=1) +
        front(c(62, 132, 4), c(96, 132, 4), c(136, 128, 6), z=2),
        behind(p("M44 112 L30 140 L50 140 Z", fill="white"), z=-2) +
        [cloud(40, 26, 14, 8, 6, 0.25), cloud(64, 16, 9, 6, 5, 0.3), l(14, 150, 186, 150)],
    ]),
    dict(name="Rocking Horse", steps=[
        [e(112, 104, 40, 20, fill="white")],
        [c(76, 52, 18, fill="white"), front(e(56, 62, 14, 10, -10, fill="white"))[0]] +
        behind(p("M82 66 L94 104 L120 96 L92 46 Z", fill="white"), z=-0.5),
        behind(p("M88 114 L56 164 L68 164 L100 114 Z", fill="white"), p("M126 114 L152 158 L164 158 L138 114 Z", fill="white"), z=-1),
        [front(p("M34 150 Q100 192 172 150 L172 160 Q100 202 34 160 Z", fill="white"))[0]],
        behind(*[c(98 + 6 * k, 46 + 13 * k, 8, fill="white") for k in range(4)], z=-0.8) +
        behind(p("M80 36 L84 22 L92 38 Z", fill="white"), z=-0.5) +
        [eye(78, 48, 3.5), dot(50, 62, 1.8), p("M100 86 Q114 78 128 86"),
         behind(p("M150 100 Q178 98 174 132 Q162 118 152 114 Z", fill="white"), z=-1)[0]],
    ]),
    dict(name="Drum", steps=[
        [e(100, 74, 54, 16, fill="white")],
        behind(p("M46 74 L46 140 Q100 166 154 140 L154 74 Z", fill="white")),
        [p("M46 88 Q100 112 154 88"), p("M46 128 Q100 152 154 128")],
        [p("M50 92 L66 136 L82 98 L100 142 L118 98 L134 136 L150 92")],
        front(l(66, 30, 112, 66), l(134, 30, 88, 66), c(64, 28, 6, fill="white"), c(136, 28, 6, fill="white"), z=2),
    ]),
    dict(name="Nutcracker", steps=[
        [r(82, 60, 36, 34, 6, fill="white")],
        behind(r(80, 20, 40, 42, 6, fill="white")) + [l(80, 52, 120, 52), front(cloud(100, 16, 10, 8, 5, 0.3, fill="white"), z=-0.5)[0]],
        behind(r(76, 94, 48, 48, 6, fill="white")) + [l(76, 124, 124, 124), dot(100, 104, 2.5), dot(100, 114, 2.5)],
        behind(*sym(r(62, 96, 14, 40, 6, fill="white"), r(84, 142, 14, 30, 2, fill="white"), r(80, 166, 20, 10, 4, fill="ink")), z=-2),
        sym(eye(93, 70, 3.5)) + [p("M100 80 Q92 74 86 80 Q92 84 100 80 Q108 84 114 80 Q108 74 100 80 Z", fill="white"),
                                 r(90, 84, 20, 8, 2), l(95, 84, 95, 92), l(100, 84, 100, 92), l(105, 84, 105, 92)],
    ]),
    dict(name="Jack-in-the-Box", steps=[
        [r(58, 112, 84, 62, 4, fill="white")],
        behind(p("M58 112 L30 82 L44 70 L72 104 Z", fill="white")),
        [p("M100 112 L84 104 L116 96 L84 88 L116 80 L100 74")],
        [front(c(100, 56, 20, fill="white"), z=1)[0]] + front(*sym(eye(93, 54, 3.5)), p("M92 64 Q100 70 108 64"), c(100, 59, 3.5, fill="ink"), z=2),
        behind(p("M82 46 L100 14 L118 46 Z", fill="white"), z=0.5) + [front(c(100, 13, 5, fill="white"), z=0.6)[0],
         star(100, 143, 14, 6), p("M42 120 L48 128 M158 120 L152 128")],
    ]),
    dict(name="Wind-Up Mouse", steps=[
        [p("M40 140 Q46 92 100 88 Q150 88 158 140 Z", fill="white")],
        behind(c(68, 88, 14, fill="white")) + behind(c(68, 88, 6), z=-0.5),
        [eye(56, 116, 4.5), c(40, 132, 5, fill="ink"), p("M42 126 L22 120 M42 132 L22 134")],
        behind(c(70, 146, 10, fill="white"), c(132, 146, 10, fill="white"), p("M158 138 Q184 136 178 112")),
        [front(r(100, 66, 8, 22, 2, fill="white"), z=-1)[0]] +
        behind(p("M104 66 Q88 50 96 42 Q104 40 104 54 Q104 40 112 42 Q120 50 104 66 Z", fill="white"), z=-1.2),
    ]),
    dict(name="Spinning Top", steps=[
        [p("M100 170 L54 106 Q54 78 100 74 Q146 78 146 106 Z", fill="white")],
        behind(r(94, 46, 12, 30, 4, fill="white")) + [front(e(100, 46, 10, 4, fill="white"), z=-0.5)[0]],
        [p("M56 102 Q100 118 144 102")],
        [p("M66 122 Q100 136 134 122"), p("M80 142 Q100 150 120 142")],
        [p("M34 100 Q28 114 34 128"), p("M166 100 Q172 114 166 128"), p("M84 178 Q100 184 116 178")],
    ]),
]
