from draw import *

CATEGORY = "Dinosaurs and Prehistoric Creatures"

TREX_BODY = p("M88 78 C60 96 62 150 100 158 Q140 166 184 168 Q150 140 136 112 Q124 86 112 78 Z", fill="white")
TREX_LEGS = behind(r(78, 146, 18, 30, 8, fill="white"), r(110, 150, 18, 26, 8, fill="white"), z=-2)

SUBJECTS = [
    dict(name="T. Rex", steps=[
        [r(54, 36, 70, 44, 20, fill="white")],
        behind(TREX_BODY),
        [eye(80, 52), dot(60, 48, 2.2), p("M58 66 Q80 74 104 68"),
         p("M68 69 L70 74 L73 70"), p("M84 71 L86 76 L89 71")],
        [p("M68 110 Q58 112 58 122"), p("M74 120 Q66 124 68 132")],
        TREX_LEGS,
        behind(p("M118 84 L132 80 L126 94 Z", fill="white"), p("M130 100 L144 98 L136 110 Z", fill="white"),
               p("M142 120 L156 122 L146 132 Z", fill="white"), z=-1.5),
    ]),
    dict(name="Stegosaurus", steps=[
        [p("M52 146 Q54 86 106 84 Q150 86 158 134 Q172 144 192 140 Q178 156 150 154 L60 152 Q52 152 52 146 Z", fill="white")],
        front(e(42, 128, 20, 15, fill="white")) + front(eye(38, 124, 4), z=2) +
        front(p("M26 132 Q32 137 40 134"), z=2),
        behind(p("M58 114 L52 84 L76 98 Z", fill="white"), p("M78 94 L80 62 L98 86 Z", fill="white"),
               p("M102 86 L112 56 L122 88 Z", fill="white"), p("M128 92 L146 68 L144 100 Z", fill="white"),
               p("M146 110 L170 98 L156 124 Z", fill="white")),
        behind(r(66, 140, 18, 26, 7, fill="white"), r(122, 140, 18, 26, 7, fill="white"), z=-2),
        behind(p("M178 142 L182 126 L188 141 Z", fill="white"), p("M168 146 L168 132 L176 144 Z", fill="white")),
        [c(90, 120, 6), c(116, 108, 5), c(132, 130, 6)],
    ]),
    dict(name="Long-Neck Dino", steps=[
        [e(120, 136, 46, 28, fill="white")],
        behind(p("M84 128 Q70 84 66 48 L90 46 Q94 90 110 114 Z", fill="white")),
        front(e(72, 42, 22, 14, fill="white")) +
        front(eye(70, 38, 4.5), dot(54, 38, 2), p("M52 48 Q58 52 66 50"), z=2),
        behind(r(90, 148, 16, 32, 7, fill="white"), r(140, 148, 16, 32, 7, fill="white"), z=-2),
        behind(p("M160 130 Q188 138 196 160 Q176 150 156 150 Z", fill="white")),
        [c(116, 124, 6), c(136, 134, 5), c(100, 140, 4)],
    ]),
    dict(name="Triceratops", steps=[
        [e(124, 128, 44, 30, fill="white")],
        behind(c(86, 100, 32, fill="white"), z=-0.5) + behind(c(76, 76, 3), c(98, 74, 3), c(112, 92, 3), z=-0.4),
        front(e(62, 118, 30, 22, fill="white")),
        front(p("M60 100 L46 62 L72 98 Z", fill="white"), p("M36 112 L22 98 L40 106 Z", fill="white"), z=0.5),
        front(eye(62, 112, 5), p("M36 128 Q46 134 56 130"), z=2) +
        behind(r(96, 140, 18, 30, 8, fill="white"), r(142, 140, 18, 30, 8, fill="white"), z=-2) +
        behind(p("M164 122 Q188 128 196 148 Q178 142 162 142 Z", fill="white")),
    ]),
    dict(name="Pterodactyl", steps=[
        front(e(100, 110, 16, 26, fill="white")),
        behind(*sym(p("M88 98 L26 82 Q38 106 44 120 Q62 110 88 118 Z", fill="white"))),
        front(c(100, 74, 16, fill="white"), z=2) + behind(p("M100 60 L116 38 L110 64 Z", fill="white"), z=0.5),
        front(p("M94 82 L100 100 L106 82 Z", fill="white"), z=2.5) + front(*sym(eye(94, 72, 3.6)), z=3),
        sym(l(94, 134, 92, 144), l(44, 120, 58, 100)),
        [cloud(160, 42, 16, 8, 6, 0.2), cloud(40, 164, 18, 8, 6, 0.2)],
    ]),
    dict(name="Baby Dino", steps=[
        [front(p("M50 120 L62 108 L74 122 L88 106 L100 122 L112 106 L126 122 L138 108 L150 120 Q152 176 100 176 Q48 176 50 120 Z", fill="white"))[0]],
        [c(100, 92, 32, fill="white")],
        sym(eye(88, 88)) + [p("M92 104 Q100 110 108 104")] + sym(dot(96, 98, 1.6)),
        [p("M72 70 Q100 40 128 70 L118 64 L110 72 L100 62 L90 72 L82 64 Z")],
        front(*sym(e(70, 116, 9, 6, fill="white")), z=2),
        [p("M70 150 L80 140 L90 150"), p("M112 156 L122 146 L132 156")],
    ]),
    dict(name="Ankylosaurus", steps=[
        [p("M44 140 Q52 90 106 88 Q160 90 168 140 Z", fill="white")],
        front(e(38, 132, 18, 14, fill="white")) + front(eye(34, 128, 4), p("M24 136 Q30 140 36 138"), z=2),
        [front(r(38, 136, 136, 10, 5, fill="white"))[0], c(80, 112, 5), c(104, 104, 5), c(128, 112, 5),
         c(92, 126, 4), c(116, 126, 4)],
        behind(r(58, 140, 16, 22, 6, fill="white"), r(132, 140, 16, 22, 6, fill="white")),
        behind(p("M166 132 Q182 130 186 126")) + [front(c(192, 124, 8, fill="white"))[0]],
    ]),
    dict(name="Spinosaurus", steps=[
        [r(40, 44, 84, 32, 16, fill="white")],
        behind(TREX_BODY),
        behind(p("M104 82 C108 28 172 28 166 84 Q158 102 142 116 Z", fill="white"), z=-1.5) +
        behind(l(118, 84, 122, 44), l(132, 92, 142, 42), l(144, 104, 160, 56), z=-1.2),
        [eye(82, 56), dot(46, 54, 2.2), p("M44 68 Q70 74 100 70")],
        [p("M68 110 Q58 112 58 122")] + TREX_LEGS,
    ]),
]
