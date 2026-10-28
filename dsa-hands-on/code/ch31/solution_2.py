"""Exercise 31.2: solve a 4 x 4 sudoku (digits 1-4; every row, column
and 2 x 2 box holds each digit once) by backtracking. 0 is empty."""


def solve(board):
    for r in range(4):
        for c in range(4):
            if board[r][c] == 0:
                for d in range(1, 5):
                    if fits(board, r, c, d):
                        board[r][c] = d
                        if solve(board):
                            return True
                        board[r][c] = 0  # undo and try the next digit
                return False  # nothing fits here: backtrack
    return True  # no empty cell left


def fits(board, r, c, d):
    box_r, box_c = r // 2 * 2, c // 2 * 2
    box = [
        board[i][j]
        for i in range(box_r, box_r + 2)
        for j in range(box_c, box_c + 2)
    ]
    column = [board[i][c] for i in range(4)]
    return d not in board[r] and d not in column and d not in box


board = [[1, 0, 0, 0], [0, 0, 3, 0], [0, 4, 0, 0], [0, 0, 0, 2]]
solve(board)
for row in board:
    print(*row)
