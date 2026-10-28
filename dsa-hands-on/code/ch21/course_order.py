"""In which order can the courses be taken? An edge A -> B means A must
come before B: a topological order of the prerequisite graph."""

from search import topological_order

before = {
    "Python": ["Data Structures", "Web"],
    "Math": ["Algorithms", "Statistics"],
    "Data Structures": ["Algorithms"],
    "Algorithms": ["Machine Learning"],
    "Statistics": ["Machine Learning"],
    "Web": [],
    "Machine Learning": [],
}
for i, course in enumerate(topological_order(before), 1):
    print(i, course)
before["Machine Learning"].append("Python")  # a cycle: impossible
print(topological_order(before))
