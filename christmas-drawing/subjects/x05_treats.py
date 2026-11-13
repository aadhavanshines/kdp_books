from draw import *

CATEGORY = "Holiday Treats"

SUBJECTS = [
    dict(name="Gingerbread House", steps=[
        [r(48, 98, 104, 72, fill="white")],
        [front(p("M34 102 L100 44 L166 102 Z", fill="white"))[0]],
        [front(p("M40 98 Q46 106 52 98 Q58 106 64 92 Q70 98 76 86 Q82 92 88 76 Q94 82 100 70 Q106 82 112 76 Q118 92 124 86 Q130 98 136 92 Q142 106 148 98 Q154 106 160 98"), z=1)[0]],
        [r(88, 128, 24, 42, 12, fill="white"), r(58, 112, 20, 20, 3), r(122, 112, 20, 20, 3)] +
        behind(r(124, 50, 16, 34, 2, fill="white")),
        [c(68, 152, 4), c(132, 152, 4), c(56, 104, 3), c(144, 104, 3), c(100, 92, 6), p("M90 92 Q100 100 110 92")],
    ]),
    dict(name="Star Cookie", steps=[
        [star(100, 102, 72, 34, fill="white", rnd=0.3)],
        [star(100, 102, 58, 27, rnd=0.3)],
        sym(eye(90, 98)) + [p("M92 112 Q100 118 108 112")],
        [l(100, 52, 100, 58), l(58, 86, 64, 88), l(142, 86, 136, 88), l(76, 140, 80, 134), l(124, 140, 120, 134)],
    ]),
    dict(name="Holiday Cupcake", steps=[
        [p("M60 110 L72 170 L128 170 L140 110 Z", fill="white")],
        [front(p("M54 112 Q44 96 62 90 Q60 70 82 70 Q90 52 108 60 Q126 56 128 76 Q148 80 142 98 Q156 108 146 114 Z", fill="white"))[0]],
        [l(80, 114, 86, 170), l(100, 114, 100, 170), l(120, 114, 114, 170)],
        front(p("M100 58 Q86 44 72 50 Q80 62 100 60 Z", fill="white"), p("M100 58 Q114 44 128 50 Q120 62 100 60 Z", fill="white"), z=1.2),
        front(c(94, 54, 6, fill="white"), c(106, 54, 6, fill="white"), c(100, 46, 6, fill="white"), z=1.5),
    ]),
    dict(name="Wrapped Candy", steps=[
        [e(100, 100, 38, 26, fill="white")],
        behind(*sym(p("M64 100 L32 74 L40 100 L32 126 Z", fill="white"))),
        [p("M80 78 Q74 100 80 122"), p("M100 74 Q94 100 100 126"), p("M120 78 Q114 100 120 122")],
        sym(l(60, 100, 44, 88), l(60, 100, 44, 112)),
    ]),
    dict(name="Christmas Pudding", steps=[
        [p("M42 128 Q42 62 100 62 Q158 62 158 128 Q100 146 42 128 Z", fill="white")],
        [front(p("M52 92 Q58 68 100 66 Q142 68 148 92 Q140 104 130 96 Q120 110 110 98 Q100 112 90 98 Q80 110 70 96 Q60 104 52 92 Z", fill="white"))[0]],
        behind(e(100, 136, 74, 12, fill="white")),
        front(p("M100 66 Q84 50 70 56 Q80 70 100 66 Z", fill="white"), p("M100 66 Q116 50 130 56 Q120 70 100 66 Z", fill="white"), z=1.2) +
        front(c(94, 62, 6, fill="white"), c(106, 62, 6, fill="white"), z=1.5),
        [dot(70, 116, 2.5), dot(92, 122, 2.5), dot(118, 118, 2.5), dot(136, 112, 2.5), dot(80, 106, 2.5)],
    ]),
    dict(name="Milk and Cookies", steps=[
        [e(90, 160, 74, 14, fill="white")],
        behind(r(112, 60, 44, 104, 6, fill="white")) + behind(l(112, 76, 156, 76), z=-0.9),
        [c(64, 140, 26, fill="white"), front(c(96, 132, 22, fill="white"), z=-0.5)[0]],
        [dot(56, 132, 3), dot(70, 146, 3), dot(62, 152, 3), dot(74, 132, 3), dot(98, 124, 3), dot(108, 134, 3), dot(92, 140, 3)],
        [behind(l(140, 60, 150, 30), z=-1.5)[0], p("M74 78 Q66 68 74 58"), p("M50 84 Q42 74 50 64")],
    ]),
    dict(name="Lollipop", steps=[
        [c(100, 74, 42, fill="white")],
        [p("M100 74 Q108 74 108 66 Q108 56 96 58 Q84 62 86 76 Q90 94 108 92 Q128 88 126 68 Q122 44 96 44 Q66 46 64 76 Q66 108 102 112")],
        behind(r(96, 114, 8, 70, 3, fill="white")),
        front(*sym(p("M100 124 Q78 108 76 126 Q78 140 100 126 Z", fill="white")), c(100, 125, 6, fill="white"), z=1),
    ]),
]
