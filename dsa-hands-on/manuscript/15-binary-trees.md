# Part IV: Trees

# Chapter 15: Binary Trees

Lists and queues arrange items in a line. Much of the world's data is shaped like a tree instead: folders inside folders, the elements of a web page, the structure of a Python program, an organization chart, a family tree. And some of the fastest data structures, search trees and heaps, are trees by design.

This chapter covers the basics of **binary trees**, where each node has at most two children: how to build them, the four standard ways to visit every node, and how to measure their height. The next three chapters build on them.

## Words for Trees

A tree is made of **nodes**. The top node is the **root**. Each node can have **children**, and every node except the root has exactly one **parent**. A node with no children is a **leaf**. In a binary tree, each node has at most two children, a **left** and a **right**. Every node, with everything below it, is itself a tree: its **subtree**. That's why recursion fits trees so well.

The **depth** of a node is the number of edges from the root down to it; the **height** of a tree is the greatest depth of any node. A tree of just a root has height 0, and an empty tree, by convention, height -1.

## Nodes and a Builder

```python
@include code/ch15/tree.py#L1-L33
```

`TreeNode` is a value with two child references, either of which can be `None`. Writing trees as nested constructor calls gets tedious, so `from_levels` builds one from a list of values level by level, left to right, with `None` for a missing child. It's the format that most interview problems use to describe trees. It hands out values to each node's two child positions in order, keeping a queue of nodes whose children come next: a breadth-first construction, a preview of Chapter 21.

## Four Ways to Visit Every Node

To **traverse** a tree is to visit every node once. Three traversals are depth-first, differing only in when the node itself is visited relative to its two subtrees:

```python
@include code/ch15/tree.py::preorder,inorder,postorder
```

- **Preorder** visits a node before its subtrees: useful for copying a tree or writing it out, since every parent comes before its children.
- **Inorder** visits the left subtree, then the node, then the right. For a binary search tree (Chapter 16), this gives the keys in sorted order.
- **Postorder** visits a node after both subtrees: useful whenever a node's answer depends on its children's answers, like computing sizes, heights or deleting a tree.

Each is written as a recursive generator: `yield from` passes along everything the recursive call yields. The fourth traversal goes level by level, top to bottom:

```python
@include code/ch15/tree.py::levels
```

The current level is a list of nodes; the next level is all their children. This is breadth-first search on a tree. And here they all are on one tree:

```python
@include code/ch15/tree_demo.py
```

```
@include code/ch15/tree_demo.out
```

`draw` prints the tree sideways, with the root at the left edge and the right subtree above it: tilt your head to the left and it looks like a tree. It's an in-order traversal in reverse, indented by depth:

```python
@include code/ch15/tree.py::draw
```

## Without Recursion

Recursive traversals are as deep as the tree is tall. For a balanced tree that's about log₂ n, but a tree can be as tall as it has nodes, and Chapter 16 builds one. So it's worth knowing the loop version:

```python
@include code/ch15/tree.py::inorder_loop
```

The stack holds the nodes whose left subtrees are still being explored. Go as far left as possible, pushing each node; pop one, visit it, then do the same with its right subtree. It's exactly what the recursive version does with the call stack, made explicit.

## Height

```python
@include code/ch15/tree.py::height
```

Height is a postorder computation: a node's height is one more than the taller of its subtrees, with -1 for an empty subtree. A tree with n nodes has height at least about log₂ n (when it's perfectly balanced) and at most n - 1 (when it's a single chain). Almost every operation on a search tree costs O(height), which is why the next two chapters care so much about keeping it small.

## Testing

```python
@include code/ch15/test_tree.py
```

```
@include code/ch15/test_tree.out
```

`random_tree` builds random trees of any shape, by choosing at random how many nodes go into the left subtree. The test runs both in-order traversals on 300 of them and checks that they agree.

## Expression Trees

Here's a tree that a program actually computes with. An arithmetic expression has a natural tree shape: operators inside, numbers at the leaves.

```python
@include code/ch15/expression_tree.py
```

```
@include code/ch15/expression_tree.out
```

`evaluate` is a postorder traversal: it computes both subtrees, then applies the operator. `to_text` is an in-order traversal that wraps each operation in brackets, to show the structure.

> **Real-World Use:** This is how Python reads your code. Before running anything, Python parses the source into an **abstract syntax tree**, a tree of nodes for every expression and statement, and compiles it from there. You can look at it yourself: `import ast; print(ast.dump(ast.parse("(3 + 4) * (5 - 2)"), indent=2))` prints a tree of `BinOp` nodes with `Constant` leaves, the same shape as the tree above.

## Key Takeaways

- A binary tree is a root node with up to two subtrees, each of which is itself a binary tree.
- Preorder, inorder and postorder visit a node before, between or after its subtrees; level order visits by depth.
- Postorder suits computations where a node depends on its children: height, size, evaluating expressions.
- Recursive traversals can be rewritten with an explicit stack, which matters for very tall trees.
- Operations on trees typically cost O(height): from about log₂ n for a balanced tree to n - 1 for a chain.

## Exercises

1. **Mirror.** Swap the left and right children of every node in a tree.
2. **Diameter.** Find the number of edges on the longest path between any two nodes. (Hint: the longest path through a node is the height of its left subtree plus the height of its right subtree plus 2.)
3. **Lowest common ancestor.** Find the deepest node that has two given values in its subtree.
