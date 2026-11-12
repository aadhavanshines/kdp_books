from draw import *

CATEGORY = "Magic and Monsters"

SUBJECTS = [
    dict(name="Dragon", steps=[
        [e(100, 66, 34, 28, fill="white")],
        behind(*sym(p("M82 44 Q70 26 84 18 Q88 32 94 40 Z", fill="white"),
                    p("M68 58 L48 50 L60 66 L46 74 L68 78 Z", fill="white"))),
        front(e(100, 82, 21, 12, fill="white")) +
        front(dot(93, 78, 2), dot(107, 78, 2), p("M90 86 Q100 92 110 86"), p("M94 88 L96 93 L99 89"), z=2) +
        sym(eye(86, 60)),
        behind(p("M78 90 Q58 150 78 172 L122 172 Q142 150 122 90 Z", fill="white"), z=-2) +
        behind(e(100, 138, 15, 24), l(87, 128, 113, 128), l(85, 140, 115, 140), l(88, 152, 112, 152), z=-1.8),
        behind(*sym(p("M72 112 L32 82 L40 108 L20 114 L42 128 L68 134 Z", fill="white")), z=-3) +
        behind(*sym(e(84, 174, 13, 6, fill="white")), z=-1.5) +
        behind(p("M126 162 Q162 172 166 148"), p("M158 150 L170 130 L180 150 L168 146 Z", fill="white"), z=-3),
    ]),
    dict(name="Unicorn", steps=[
        [c(92, 72, 28, fill="white")] + [front(e(62, 92, 22, 16, -10, fill="white"))[0]],
        behind(p("M100 48 L108 24 L116 52 Z", fill="white"), p("M86 46 L76 12 L96 42 Z", fill="white")) +
        [l(82, 33, 90, 30), l(79, 23, 85, 21)],
        front(eye(88, 66, 5), dot(48, 90, 2.2), p("M46 100 Q54 105 62 100"), z=2) +
        behind(*[c(118 + 7 * k, 68 + 15 * k, 10, fill="white") for k in range(5)], z=-1.6),
        behind(e(130, 144, 42, 26, fill="white"), z=-2) +
        behind(p("M106 142 Q94 122 86 94 L116 74 Q126 104 146 136", fill="white"), z=-1.5),
        behind(r(100, 156, 12, 26, 5, fill="white"), r(146, 156, 12, 26, 5, fill="white"), z=-2.5) +
        behind(p("M168 134 Q194 142 186 172 Q176 152 164 148 Z", fill="white"), z=-2.5),
    ]),
    dict(name="Ghost", steps=[
        [p("M56 168 L56 90 Q56 40 100 40 Q144 40 144 90 L144 168 Q133 156 122 168 Q111 156 100 168 Q89 156 78 168 Q67 156 56 168 Z", fill="white")],
        behind(*sym(p("M58 102 Q38 104 40 120 Q50 122 58 116 Z", fill="white"))),
        sym(e(86, 88, 6, 9, fill="ink")) + [e(100, 114, 7, 9)],
        sym(e(74, 104, 6, 3.5)),
        [star(160, 40, 10, 4), star(36, 60, 7, 3), star(166, 150, 6, 2.5)],
    ]),
    dict(name="Friendly Monster", steps=[
        [cloud(100, 110, 48, 54, 14, 0.12, fill="white")],
        behind(*sym(p("M68 68 L58 34 L84 56 Z", fill="white"))),
        [front(c(100, 92, 20, fill="white"))[0], front(eye(100, 94, 9), z=2)[0]],
        [p("M76 126 Q100 148 124 126 Z", fill="white"), p("M86 129 L90 137 L94 131"), p("M106 131 L110 137 L114 129")],
        behind(*sym(p("M54 116 Q34 120 36 136"), e(80, 168, 16, 8, fill="white"))),
    ]),
    dict(name="Robot", steps=[
        [r(66, 40, 68, 50, 10, fill="white")],
        [l(100, 40, 100, 24), c(100, 20, 5, fill="white")] + sym(c(86, 62, 8, fill="white"), dot(86, 62, 3.5)),
        [r(84, 74, 32, 9, 3), l(92, 74, 92, 83), l(100, 74, 100, 83), l(108, 74, 108, 83)],
        [r(92, 90, 16, 8), r(56, 98, 88, 62, 12, fill="white")],
        [c(80, 122, 7), r(98, 114, 32, 8, 3), r(98, 130, 32, 8, 3)],
        behind(*sym(r(36, 104, 20, 40, 8, fill="white"), c(46, 152, 8, fill="white"),
                    r(72, 158, 18, 22, 4, fill="white"))),
    ]),
    dict(name="Wizard Hat", steps=[
        [p("M58 150 Q86 110 94 34 Q98 22 106 30 Q122 100 146 150 Z", fill="white")],
        behind(e(102, 152, 66, 14, fill="white")),
        [p("M64 138 Q102 150 140 138")],
        [star(96, 80, 10, 4.2), star(118, 112, 7, 3), p("M84 108 Q74 116 80 126 Q70 126 70 116 Q70 106 84 108 Z")],
        [star(40, 60, 6, 2.4, n=4), star(160, 50, 7, 2.6, n=4), star(170, 110, 5, 2, n=4)],
    ]),
    dict(name="Treasure Chest", steps=[
        [r(44, 96, 112, 64, 6, fill="white")],
        [p("M44 96 Q44 58 100 58 Q156 58 156 96 Z", fill="white")],
        [l(68, 62, 68, 160), l(132, 62, 132, 160)],
        [front(r(90, 88, 20, 22, 4, fill="white"))[0], front(dot(100, 99, 3), z=2)[0]],
        [e(30, 166, 10, 5), e(170, 166, 10, 5), e(176, 158, 10, 5), star(36, 140, 8, 3.4, n=4), star(170, 130, 8, 3.4, n=4)],
    ]),
    dict(name="Magic Potion", steps=[
        [c(100, 128, 40, fill="white")],
        behind(r(88, 60, 24, 34, 4, fill="white")),
        [front(r(84, 46, 32, 16, 5, fill="white"))[0]],
        [p("M62 122 Q82 114 100 122 Q118 130 138 122")],
        [c(88, 142, 6), c(110, 150, 4), c(106, 134, 3)],
        [star(150, 62, 10, 3.5, n=4), star(50, 70, 7, 2.6, n=4), star(156, 104, 5, 2, n=4)],
    ]),
]
