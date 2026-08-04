// ============================================================
// MR GEORGE — resident Friday-night chess opponent.
// Thin wrapper around chess.js: legal moves, board state, and a
// deliberately beatable depth-2 alpha-beta brain (material +
// central-square bonus, with randomness among near-best moves
// so casual players CAN win the 40%-off giveaway prize).
// ============================================================
import { Chess } from 'chess.js';
import type { Color, Move, PieceSymbol, Square } from 'chess.js';

export type GameStatus = 'playing' | 'checkmate' | 'stalemate' | 'draw';
export interface BoardPiece {
  square: Square;
  type: PieceSymbol;
  color: Color;
}
export interface GeorgeReply {
  from: string;
  to: string;
}

const PIECE_VALUES: Record<PieceSymbol, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
const CENTER = new Set(['d4', 'e4', 'd5', 'e5']);
const NEAR_CENTER = new Set(['c3', 'd3', 'e3', 'f3', 'c4', 'f4', 'c5', 'f5', 'c6', 'd6', 'e6', 'f6']);
const CENTER_BONUS = 0.25;
const NEAR_CENTER_BONUS = 0.1;
/** Moves scored within this band of the best move are equally likely — George plays well, not perfectly. */
const NEAR_BEST_BAND = 0.15;
const SEARCH_DEPTH = 2;
const MATE_SCORE = 10_000;

export class GeorgeEngine {
  private chess = new Chess();

  newGame(): void {
    this.chess = new Chess();
  }

  /** Apply a legal White move (auto-promotes to queen). False if illegal. */
  playerMove(from: string, to: string): boolean {
    try {
      this.chess.move({ from: from as Square, to: to as Square, promotion: 'q' });
      return true;
    } catch {
      return false;
    }
  }

  /** Mr George (Black) picks and applies a reply. Null when the game is over. */
  georgeMove(): GeorgeReply | null {
    const moves = this.chess.moves({ verbose: true });
    if (!moves.length) return null;

    const scored = moves.map(move => {
      this.chess.move(move);
      const score = this.minimax(SEARCH_DEPTH - 1, -Infinity, Infinity);
      this.chess.undo();
      return { move, score };
    });

    const best = Math.max(...scored.map(s => s.score));
    const pool = scored.filter(s => best - s.score <= NEAR_BEST_BAND);
    const pick = pool[Math.floor(Math.random() * pool.length)].move;
    this.chess.move(pick);
    return { from: pick.from, to: pick.to };
  }

  /** Minimax with alpha-beta pruning. Positive score = good for Black (George). */
  private minimax(depth: number, alpha: number, beta: number): number {
    if (this.chess.isCheckmate()) {
      // The side to move is mated. Prefer faster mates (hence the depth term).
      return this.chess.turn() === 'b' ? -(MATE_SCORE + depth) : MATE_SCORE + depth;
    }
    if (this.chess.isStalemate() || this.chess.isDraw()) return 0;
    if (depth === 0) return this.evaluate();

    const moves: Move[] = this.chess.moves({ verbose: true });
    if (this.chess.turn() === 'b') {
      let bestScore = -Infinity;
      for (const move of moves) {
        this.chess.move(move);
        bestScore = Math.max(bestScore, this.minimax(depth - 1, alpha, beta));
        this.chess.undo();
        alpha = Math.max(alpha, bestScore);
        if (beta <= alpha) break;
      }
      return bestScore;
    }
    let bestScore = Infinity;
    for (const move of moves) {
      this.chess.move(move);
      bestScore = Math.min(bestScore, this.minimax(depth - 1, alpha, beta));
      this.chess.undo();
      beta = Math.min(beta, bestScore);
      if (beta <= alpha) break;
    }
    return bestScore;
  }

  /** Material + a gentle pull toward the centre, from Black's perspective. */
  private evaluate(): number {
    let score = 0;
    for (const row of this.chess.board()) {
      for (const piece of row) {
        if (!piece) continue;
        let value = PIECE_VALUES[piece.type];
        if (CENTER.has(piece.square)) value += CENTER_BONUS;
        else if (NEAR_CENTER.has(piece.square)) value += NEAR_CENTER_BONUS;
        score += piece.color === 'b' ? value : -value;
      }
    }
    return score;
  }

  status(): GameStatus {
    if (this.chess.isCheckmate()) return 'checkmate';
    if (this.chess.isStalemate()) return 'stalemate';
    if (this.chess.isDraw()) return 'draw';
    return 'playing';
  }

  turn(): 'w' | 'b' {
    return this.chess.turn();
  }

  board(): (BoardPiece | null)[][] {
    return this.chess.board();
  }

  fen(): string {
    return this.chess.fen();
  }

  isCheck(): boolean {
    return this.chess.isCheck();
  }

  /** Destination squares for tap-to-move hints. */
  movesFrom(square: string): string[] {
    try {
      return this.chess.moves({ square: square as Square, verbose: true }).map(m => m.to);
    } catch {
      return [];
    }
  }
}
