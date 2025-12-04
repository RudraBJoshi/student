import random

# ==================== LOGIC GATES ====================
def AND(a, b):
    return a and b

def OR(a, b):
    return a or b

def NOT(a):
    return not a

def XOR(a, b):
    return a != b

def NAND(a, b):
    return not (a and b)

def NOR(a, b):
    return not (a or b)

# ==================== MAZE CELL ====================
class Cell:
    def __init__(self, row, col):
        self.row = row
        self.col = col
        self.walls = {'N': True, 'S': True, 'E': True, 'W': True}
        self.visited = False
        self.puzzle = None  # Complex logic puzzle

# ==================== MAZE GENERATION ====================
def generate_maze(width, height):
    """Generate maze with logic puzzles - MAIN PROCEDURE FOR CPT"""
    maze = [[Cell(r, c) for c in range(width)] for r in range(height)]
    
    stack = []
    current = maze[0][0]
    current.visited = True
    visited_count = 1
    
    # Iteration through all cells
    while visited_count < width * height:
        neighbors = []
        r, c = current.row, current.col
        
        # Selection: check each direction
        if r > 0 and not maze[r-1][c].visited:
            neighbors.append(('N', maze[r-1][c]))
        if r < height-1 and not maze[r+1][c].visited:
            neighbors.append(('S', maze[r+1][c]))
        if c < width-1 and not maze[r][c+1].visited:
            neighbors.append(('E', maze[r][c+1]))
        if c > 0 and not maze[r][c-1].visited:
            neighbors.append(('W', maze[r][c-1]))
        
        if neighbors:
            direction, next_cell = random.choice(neighbors)
            
            # Remove walls
            current.walls[direction] = False
            opposite = {'N': 'S', 'S': 'N', 'E': 'W', 'W': 'E'}
            next_cell.walls[opposite[direction]] = False
            
            # Add complex puzzle
            add_complex_puzzle(current)
            
            stack.append(current)
            current = next_cell
            current.visited = True
            visited_count += 1
        elif stack:
            current = stack.pop()
    
    add_complex_puzzle(current)
    return maze

def add_complex_puzzle(cell):
    """Add complex multi-gate logic puzzle to cell"""
    puzzle_types = [
        'chained_2',      # A AND B -> result -> result XOR C
        'chained_3',      # Three gates chained
        'parallel',       # Two separate operations combined
        'nested',         # Gate output feeds into another
        'triple_input',   # Three inputs, two gates
        'complex_chain'   # Most difficult: 4-gate chain
    ]
    
    puzzle_type = random.choice(puzzle_types)
    
    # Generate random inputs
    a = random.choice([True, False])
    b = random.choice([True, False])
    c = random.choice([True, False])
    d = random.choice([True, False])
    
    if puzzle_type == 'chained_2':
        # Example: (A AND B) XOR C
        gate1 = random.choice(['AND', 'OR', 'NAND', 'NOR'])
        gate2 = random.choice(['XOR', 'AND', 'OR'])
        
        if gate1 == 'AND':
            temp = AND(a, b)
        elif gate1 == 'OR':
            temp = OR(a, b)
        elif gate1 == 'NAND':
            temp = NAND(a, b)
        else:  # NOR
            temp = NOR(a, b)
        
        if gate2 == 'XOR':
            answer = XOR(temp, c)
        elif gate2 == 'AND':
            answer = AND(temp, c)
        else:  # OR
            answer = OR(temp, c)
        
        cell.puzzle = {
            'type': 'chained_2',
            'description': f"({gate1}({a}, {b})) {gate2} {c}",
            'expression': f"Step 1: {gate1}({a}, {b})\nStep 2: [Result] {gate2} {c}",
            'answer': answer
        }
    
    elif puzzle_type == 'chained_3':
        # Example: NOT(A) AND B -> result XOR C
        temp1 = NOT(a)
        temp2 = AND(temp1, b)
        answer = XOR(temp2, c)
        
        cell.puzzle = {
            'type': 'chained_3',
            'description': f"XOR(AND(NOT({a}), {b}), {c})",
            'expression': f"Step 1: NOT({a})\nStep 2: AND([Step1], {b})\nStep 3: XOR([Step2], {c})",
            'answer': answer
        }
    
    elif puzzle_type == 'parallel':
        # Example: (A XOR B) AND (C OR D)
        temp1 = XOR(a, b)
        temp2 = OR(c, d)
        answer = AND(temp1, temp2)
        
        cell.puzzle = {
            'type': 'parallel',
            'description': f"(XOR({a}, {b})) AND (OR({c}, {d}))",
            'expression': f"Branch 1: XOR({a}, {b})\nBranch 2: OR({c}, {d})\nCombine: [Branch1] AND [Branch2]",
            'answer': answer
        }
    
    elif puzzle_type == 'nested':
        # Example: NAND(A, OR(B, C))
        temp = OR(b, c)
        answer = NAND(a, temp)
        
        cell.puzzle = {
            'type': 'nested',
            'description': f"NAND({a}, OR({b}, {c}))",
            'expression': f"Inner: OR({b}, {c})\nOuter: NAND({a}, [Inner])",
            'answer': answer
        }
    
    elif puzzle_type == 'triple_input':
        # Example: (A AND B) OR (B AND C)
        temp1 = AND(a, b)
        temp2 = AND(b, c)
        answer = OR(temp1, temp2)
        
        cell.puzzle = {
            'type': 'triple_input',
            'description': f"(AND({a}, {b})) OR (AND({b}, {c}))",
            'expression': f"Left: AND({a}, {b})\nRight: AND({b}, {c})\nCombine: [Left] OR [Right]",
            'answer': answer
        }
    
    else:  # complex_chain
        # Example: XOR(NOT(A AND B), C OR D)
        temp1 = AND(a, b)
        temp2 = NOT(temp1)
        temp3 = OR(c, d)
        answer = XOR(temp2, temp3)
        
        cell.puzzle = {
            'type': 'complex_chain',
            'description': f"XOR(NOT(AND({a}, {b})), OR({c}, {d}))",
            'expression': f"Step 1: AND({a}, {b})\nStep 2: NOT([Step1])\nStep 3: OR({c}, {d})\nStep 4: XOR([Step2], [Step3])",
            'answer': answer
        }

# ==================== DISPLAY ====================
def display_maze(maze, player_pos, width, height):
    """Show maze with player position"""
    print("\n" + "=" * (width * 4 + 1))
    
    for r in range(height):
        # Top walls
        line = ""
        for c in range(width):
            line += "+---" if maze[r][c].walls['N'] else "+   "
        print(line + "+")
        
        # Cells
        line = ""
        for c in range(width):
            line += "|" if maze[r][c].walls['W'] else " "
            
            if (r, c) == player_pos:
                line += " P "
            elif (r, c) == (height-1, width-1):
                line += " E "
            elif (r, c) == (0, 0):
                line += " S "
            else:
                line += "   "
        
        line += "|" if maze[r][width-1].walls['E'] else " "
        print(line)
    
    # Bottom
    print("+---" * width + "+")
    print("=" * (width * 4 + 1))

# ==================== PUZZLE ====================
def solve_puzzle(cell):
    """Present complex puzzle and check answer"""
    if not cell.puzzle:
        return True
    
    puzzle = cell.puzzle
    
    print(f"\n{'='*60}")
    print("⚡ COMPLEX LOGIC GATE PUZZLE ⚡")
    print(f"{'='*60}")
    print(f"\nPuzzle Type: {puzzle['type'].upper()}")
    print(f"\n{puzzle['expression']}")
    print(f"\nFull Expression: {puzzle['description']}")
    print(f"\n{'='*60}")
    
    # Give hint option
    hint = input("\nWant a hint? (y/n): ").strip().lower()
    if hint == 'y':
        print("\n HINT: Work through each step carefully!")
        print("   Remember:")
        print("   - AND: Both must be True")
        print("   - OR: At least one must be True")
        print("   - XOR: Exactly one must be True")
        print("   - NOT: Flips the value")
        print("   - NAND: Opposite of AND")
        print("   - NOR: Opposite of OR")
    
    answer = input("\nYour answer (True/False or T/F): ").strip().upper()
    user_answer = answer in ['TRUE', 'T', '1']
    
    if user_answer == puzzle['answer']:
        print(f"\n✓ CORRECT!")
        return True
    else:
        print(f"\n✗ WRONG! The correct answer is {puzzle['answer']}")
        print("You've been sent back to the start!")
        return False

# ==================== GAME ====================
def play_game():
    """Main game loop"""
    print("="*60)
    print("ADVANCED LOGIC GATE MAZE")
    print("="*60)
    print("\nRules:")
    print("- Navigate from S (Start) to E (Exit)")
    print("- Solve COMPLEX multi-gate logic puzzles")
    print("- Wrong answer = back to start!")
    print("- Commands: N/S/E/W or 'quit'")
    print("\nGate Reference:")
    print("  AND: True if BOTH inputs are True")
    print("  OR: True if AT LEAST ONE input is True")
    print("  XOR: True if EXACTLY ONE input is True")
    print("  NOT: Flips the input")
    print("  NAND: NOT(AND) - False only if both True")
    print("  NOR: NOT(OR) - True only if both False")
    
    width, height = 5, 5
    maze = generate_maze(width, height)
    
    player_pos = (0, 0)
    moves = 0
    puzzles_solved = 0
    
    while player_pos != (height-1, width-1):
        display_maze(maze, player_pos, width, height)
        print(f"\n📍 Position: {player_pos} | 🚶 Moves: {moves} | ✓ Puzzles: {puzzles_solved}")
        
        # Get valid moves
        r, c = player_pos
        valid = []
        if not maze[r][c].walls['N'] and r > 0:
            valid.append('N')
        if not maze[r][c].walls['S'] and r < height-1:
            valid.append('S')
        if not maze[r][c].walls['E'] and c < width-1:
            valid.append('E')
        if not maze[r][c].walls['W'] and c > 0:
            valid.append('W')
        
        print(f"Valid moves: {', '.join(valid)}")
        direction = input("➤ Move: ").strip().upper()
        
        if direction == 'QUIT':
            print("\nThanks for playing!")
            return
        
        if direction not in valid:
            print("Invalid move!")
            continue
        
        # Move player
        if direction == 'N':
            new_pos = (r-1, c)
        elif direction == 'S':
            new_pos = (r+1, c)
        elif direction == 'E':
            new_pos = (r, c+1)
        else:  # W
            new_pos = (r, c-1)
        
        moves += 1
        
        # Solve puzzle
        if solve_puzzle(maze[new_pos[0]][new_pos[1]]):
            player_pos = new_pos
            puzzles_solved += 1
        else:
            player_pos = (0, 0)
            moves = 0
            puzzles_solved = 0
    
    display_maze(maze, player_pos, width, height)
    print(f"\n{'='*60}")
    print(f"CONGRATULATIONS! YOU ESCAPED!")
    print(f"{'='*60}")
    print(f"Total moves: {moves}")
    print(f"Puzzles solved: {puzzles_solved}")
    print(f"{'='*60}")

# ==================== MAIN ====================
if __name__ == "__main__":
    play_game()