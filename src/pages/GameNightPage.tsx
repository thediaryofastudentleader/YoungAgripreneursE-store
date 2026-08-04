// ============================================================
// MR GEORGE'S WALK FRIDAY — Friday-night (SAST) chess event.
// Beat Mr George (the house AI) and take 40% off a returned
// treasure from the giveaway vault. Winners enter the public
// Hall of Fame by their playing name.
// Always rendered in the luxury ink/porcelain/brass palette.
// ============================================================
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Crown, Trophy, Vault } from 'lucide-react';
import { useApp } from '@/App';
import { isFridaySAST } from '@/lib/theme';
import { getSupabase } from '@/lib/supabaseClient';
import { products } from '@/lib/data';
import { formatPrice } from '@/lib/utils';
import { GeorgeEngine } from '@/lib/chess/engine';

// ---------- Luxury palette ----------
const INK = '#0B1D1F';
const INK_SOFT = '#1B3A3D';
const PORCELAIN = '#F2EFE6';
const PORCELAIN_DIM = '#E7E1D0';
const BRASS = '#C8A96A';
const ROYAL = '#6D2077';
const SIGNAL = '#9FE0C6';

const GEORGE_AVATAR = 'https://api.dicebear.com/7.x/identicon/svg?seed=mr-george';
const GEORGE_QUOTE = 'Beat me and take 40% off a giveaway treasure — Mr George';
const PRIZE_PERCENT = 40;
const MAX_NAME = 24;

const GLYPHS: Record<string, { w: string; b: string }> = {
  k: { w: '♔', b: '♚' },
  q: { w: '♕', b: '♛' },
  r: { w: '♖', b: '♜' },
  b: { w: '♗', b: '♝' },
  n: { w: '♘', b: '♞' },
  p: { w: '♙', b: '♟' },
};

interface WinnerRow {
  playing_name: string;
  prize_percent: number;
  prize_product_id: string | null;
  created_at: string;
}

interface Prize {
  code: string;
  productId: string;
}

type EndResult = 'win' | 'loss' | 'draw';

const SAST_OFFSET_MS = 2 * 60 * 60 * 1000;

/** Next Friday 00:00 SAST as a real (local-clock) Date. */
function nextFridaySAST(now: Date): Date {
  const sast = new Date(now.getTime() + SAST_OFFSET_MS);
  const target = new Date(sast);
  target.setUTCHours(0, 0, 0, 0);
  let add = (5 - target.getUTCDay() + 7) % 7;
  if (add === 0) add = 7;
  target.setUTCDate(target.getUTCDate() + add);
  return new Date(target.getTime() - SAST_OFFSET_MS);
}

function countdownText(now: Date): string {
  const ms = nextFridaySAST(now).getTime() - now.getTime();
  const totalMin = Math.max(0, Math.floor(ms / 60_000));
  const d = Math.floor(totalMin / (60 * 24));
  const h = Math.floor((totalMin % (60 * 24)) / 60);
  const m = totalMin % 60;
  return `${d}d ${h}h ${m}m`;
}

function squareName(row: number, col: number): string {
  return `${'abcdefgh'[col]}${8 - row}`;
}

function productTitle(id: string | null | undefined): string {
  if (!id) return 'Mystery treasure';
  return products.find(p => p.id === id)?.title ?? 'Mystery treasure';
}

export default function GameNightPage() {
  const { user, showToast, setShowLogin } = useApp();
  const supabase = getSupabase();

  // Re-render every 30s so the Friday gate + countdown stay honest.
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);
  const friday = isFridaySAST();

  // ---------- Game state ----------
  const engineRef = useRef<GeorgeEngine | null>(null);
  if (!engineRef.current) engineRef.current = new GeorgeEngine();
  const engine = engineRef.current;
  const thinkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const endedRef = useRef(false);

  const [seated, setSeated] = useState(false);
  const [playingName, setPlayingName] = useState('');
  const [fen, setFen] = useState(engine.fen());
  const [selected, setSelected] = useState<string | null>(null);
  const [legalTargets, setLegalTargets] = useState<string[]>([]);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [thinking, setThinking] = useState(false);
  const [endResult, setEndResult] = useState<EndResult | null>(null);
  const [prize, setPrize] = useState<Prize | null>(null);
  const [endNote, setEndNote] = useState<string | null>(null);

  // Prefill a playing-name suggestion from the username.
  useEffect(() => {
    if (user && !playingName) setPlayingName((user.username || '').slice(0, MAX_NAME));
  }, [user, playingName]);

  useEffect(() => () => {
    if (thinkTimer.current) clearTimeout(thinkTimer.current);
  }, []);

  // ---------- Hall of Fame + giveaway vault (always visible) ----------
  const [winners, setWinners] = useState<WinnerRow[]>([]);
  const [winnersLoaded, setWinnersLoaded] = useState(false);
  const [vaultIds, setVaultIds] = useState<string[]>([]);
  const [boardRefresh, setBoardRefresh] = useState(0);

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    supabase
      .from('chess_winners')
      .select('*')
      .limit(20)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (!error && data) setWinners(data as unknown as WinnerRow[]);
        setWinnersLoaded(true);
      });
    supabase
      .from('giveaway_products')
      .select('product_id')
      .eq('claimed', false)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (!error && data) setVaultIds((data as Array<{ product_id: string }>).map(r => r.product_id));
      });
    return () => { cancelled = true; };
  }, [supabase, boardRefresh]);

  // ---------- Game flow ----------
  const conclude = useCallback((result: EndResult) => {
    if (endedRef.current) return;
    endedRef.current = true;
    setEndResult(result);

    if (!supabase) {
      setEndNote('Store offline — this game could not be recorded.');
      return;
    }
    if (result === 'win') {
      supabase
        .rpc('claim_chess_prize', { p_playing_name: playingName })
        .then(({ data, error }) => {
          if (error) {
            setEndNote(error.message);
            return;
          }
          const rows = data as Array<{ prize_code: string; prize_product_id: string }> | null;
          if (rows && rows.length > 0) {
            setPrize({ code: rows[0].prize_code, productId: rows[0].prize_product_id });
            setBoardRefresh(k => k + 1);
            showToast('Prize claimed — welcome to the Hall of Fame!', 'success');
          } else {
            setEndNote('The vault stayed quiet — no prize was issued.');
          }
        });
    } else {
      supabase
        .rpc('record_chess_game', { p_playing_name: playingName, p_result: result })
        .then(({ error }) => {
          if (error) setEndNote(error.message);
        });
    }
  }, [supabase, playingName, showToast]);

  const checkEnd = useCallback(() => {
    const status = engine.status();
    if (status === 'playing') return false;
    if (status === 'checkmate') {
      // Side to move is mated: if Black is to move, White (you) won.
      conclude(engine.turn() === 'b' ? 'win' : 'loss');
    } else {
      conclude('draw');
    }
    return true;
  }, [engine, conclude]);

  const handleSquare = useCallback((sq: string) => {
    if (!seated || thinking || endResult || engine.turn() !== 'w') return;

    // Tap a highlighted destination → move.
    if (selected && legalTargets.includes(sq)) {
      if (!engine.playerMove(selected, sq)) return;
      setLastMove({ from: selected, to: sq });
      setSelected(null);
      setLegalTargets([]);
      setFen(engine.fen());
      if (checkEnd()) return;
      setThinking(true);
      thinkTimer.current = setTimeout(() => {
        const reply = engine.georgeMove();
        if (reply) setLastMove(reply);
        setFen(engine.fen());
        setThinking(false);
        checkEnd();
      }, 300);
      return;
    }

    // Tap one of your own pieces → select + show legal targets.
    const file = 'abcdefgh'.indexOf(sq[0]);
    const rank = 8 - Number(sq[1]);
    const piece = engine.board()[rank]?.[file];
    if (piece && piece.color === 'w') {
      setSelected(sq);
      setLegalTargets(engine.movesFrom(sq));
    } else {
      setSelected(null);
      setLegalTargets([]);
    }
  }, [seated, thinking, endResult, selected, legalTargets, engine, checkEnd]);

  const takeSeat = () => {
    const name = playingName.trim();
    if (!name) {
      showToast('Choose a playing name first', 'error');
      return;
    }
    setPlayingName(name.slice(0, MAX_NAME));
    engine.newGame();
    endedRef.current = false;
    setFen(engine.fen());
    setSelected(null);
    setLegalTargets([]);
    setLastMove(null);
    setThinking(false);
    setEndResult(null);
    setPrize(null);
    setEndNote(null);
    setSeated(true);
  };

  const playAgain = () => {
    if (thinkTimer.current) clearTimeout(thinkTimer.current);
    engine.newGame();
    endedRef.current = false;
    setFen(engine.fen());
    setSelected(null);
    setLegalTargets([]);
    setLastMove(null);
    setThinking(false);
    setEndResult(null);
    setPrize(null);
    setEndNote(null);
  };

  const statusLine = useMemo(() => {
    if (thinking) return 'Mr George is thinking…';
    if (engine.isCheck() && engine.turn() === 'w') return 'Check!';
    return 'Your move';
    // fen in deps ties this to every position change.
  }, [thinking, fen, engine]);

  const prizeProduct = prize ? products.find(p => p.id === prize.productId) : undefined;
  const vaultProducts = vaultIds.map(id => products.find(p => p.id === id)).filter(p => p !== undefined);

  // ---------- Render ----------
  return (
    <div className="min-h-screen" style={{ background: INK, color: PORCELAIN }}>
      <header className="sticky top-0 z-40 border-b backdrop-blur-xl" style={{ background: `${INK}F2`, borderColor: `${BRASS}44` }}>
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/" className="p-2 -ml-2 rounded-full transition-colors hover:opacity-70" aria-label="Back to store">
            <ChevronLeft size={22} color={PORCELAIN} />
          </Link>
          <h1 className="font-display text-lg font-semibold tracking-wide">Mr George's Walk Friday</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8 space-y-10">
        {/* ---- Mr George's welcome ---- */}
        <section className="text-center">
          <img
            src={GEORGE_AVATAR}
            alt="Mr George"
            className="w-20 h-20 rounded-full mx-auto mb-3 border-2"
            style={{ borderColor: BRASS, background: PORCELAIN }}
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <h2 className="font-display text-3xl font-bold mb-2" style={{ color: BRASS }}>
            The board is set.
          </h2>
          <p className="text-sm italic opacity-80">"{GEORGE_QUOTE}"</p>
        </section>

        {/* ---- Gates + game ---- */}
        {!supabase ? (
          <section className="rounded-3xl border p-8 text-center" style={{ borderColor: `${BRASS}55`, background: INK_SOFT }}>
            <p className="font-display text-xl mb-2">Store offline</p>
            <p className="text-sm opacity-70">
              The store is not connected to the database right now, so Mr George cannot keep score.
              The board reopens as soon as the connection returns.
            </p>
          </section>
        ) : !friday ? (
          <section className="rounded-3xl border p-8 text-center" style={{ borderColor: `${BRASS}55`, background: INK_SOFT }}>
            <p className="text-4xl mb-3">🎩</p>
            <p className="font-display text-2xl mb-2" style={{ color: BRASS }}>
              Mr George only walks on Fridays
            </p>
            <p className="text-sm opacity-70 mb-4">
              He is somewhere along High Street, Grahamstown, waiting for Friday night (SAST).
            </p>
            <p className="font-price text-sm" style={{ color: SIGNAL }}>
              Next walk in {countdownText(now)}
            </p>
            <p className="text-xs opacity-50 mt-4">
              Meanwhile, admire last week's champions below.
            </p>
          </section>
        ) : !user ? (
          <section className="rounded-3xl border p-8 text-center" style={{ borderColor: `${BRASS}55`, background: INK_SOFT }}>
            <p className="font-display text-2xl mb-2" style={{ color: BRASS }}>
              Sign in to take your seat at the board
            </p>
            <p className="text-sm opacity-70 mb-6">
              Every game is recorded, and every champion is crowned by playing name.
            </p>
            <button
              onClick={() => setShowLogin(true)}
              className="px-8 py-3 rounded-full font-bold text-sm transition-transform hover:scale-105"
              style={{ background: BRASS, color: INK }}
            >
              Sign in
            </button>
          </section>
        ) : !seated ? (
          <section className="rounded-3xl border p-8" style={{ borderColor: `${BRASS}55`, background: INK_SOFT }}>
            <p className="font-display text-2xl mb-2 text-center" style={{ color: BRASS }}>
              Friday night. Your move first.
            </p>
            <p className="text-sm opacity-70 mb-6 text-center">
              Choose the playing name that will echo in the Hall of Fame if you win.
            </p>
            <label className="block text-xs uppercase tracking-widest mb-2" style={{ color: BRASS }}>
              Playing name
            </label>
            <input
              value={playingName}
              onChange={e => setPlayingName(e.target.value.slice(0, MAX_NAME))}
              maxLength={MAX_NAME}
              placeholder="e.g. Bishop of Bathurst St"
              className="w-full rounded-2xl px-4 py-3 text-sm outline-none mb-2"
              style={{ background: INK, color: PORCELAIN, border: `1px solid ${BRASS}66` }}
            />
            <p className="text-[11px] opacity-50 mb-6">{playingName.length}/{MAX_NAME} characters</p>
            <button
              onClick={takeSeat}
              disabled={!playingName.trim()}
              className="w-full py-3 rounded-full font-bold text-sm transition-transform hover:scale-[1.02] disabled:opacity-40 disabled:hover:scale-100"
              style={{ background: BRASS, color: INK }}
            >
              Take your seat
            </button>
          </section>
        ) : (
          <section>
            {/* Status line */}
            <div className="flex items-center justify-between mb-3">
              <p className="font-price text-xs uppercase tracking-widest" style={{ color: BRASS }}>
                {playingName} vs Mr George
              </p>
              {!endResult && (
                <p className="text-sm font-bold" style={{ color: thinking ? SIGNAL : PORCELAIN }}>
                  {statusLine}
                </p>
              )}
            </div>

            {/* The board */}
            <div
              className="grid grid-cols-8 rounded-2xl overflow-hidden border-2 shadow-2xl"
              style={{ borderColor: BRASS }}
            >
              {engine.board().map((rowArr, r) =>
                rowArr.map((piece, c) => {
                  const sq = squareName(r, c);
                  const light = (r + c) % 2 === 0;
                  const isSel = selected === sq;
                  const isTarget = legalTargets.includes(sq);
                  const isLast = !!lastMove && (lastMove.from === sq || lastMove.to === sq);
                  return (
                    <button
                      key={sq}
                      onClick={() => handleSquare(sq)}
                      className="relative aspect-square flex items-center justify-center"
                      style={{
                        background: isSel ? BRASS : light ? PORCELAIN_DIM : INK_SOFT,
                        boxShadow: isLast && !isSel ? `inset 0 0 0 3px ${BRASS}88` : undefined,
                      }}
                      aria-label={sq}
                    >
                      {isTarget && (
                        <span
                          className="absolute w-2.5 h-2.5 rounded-full"
                          style={{ background: piece ? ROYAL : BRASS }}
                        />
                      )}
                      {piece && (
                        <span
                          className="text-3xl sm:text-4xl leading-none select-none"
                          style={
                            piece.color === 'w'
                              ? { color: PORCELAIN, textShadow: '0 1px 3px rgba(11,29,31,0.95), 0 0 2px #0B1D1F' }
                              : { color: INK, textShadow: '0 1px 2px rgba(242,239,230,0.5)' }
                          }
                        >
                          {GLYPHS[piece.type][piece.color]}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* ---- Game end ---- */}
            {endResult === 'win' && (
              <div className="mt-6 rounded-3xl border p-8 text-center" style={{ borderColor: BRASS, background: INK_SOFT }}>
                <p className="text-2xl mb-3 tracking-widest">🎉🎊👑🎊🎉</p>
                <p className="font-display text-3xl font-bold mb-2" style={{ color: BRASS }}>
                  Checkmate. You beat Mr George!
                </p>
                {prize ? (
                  <>
                    <p className="text-sm opacity-80 mb-4">
                      Your prize code — guard it with your life:
                    </p>
                    <p className="font-price text-2xl font-bold mb-6 tracking-widest" style={{ color: SIGNAL }}>
                      {prize.code}
                    </p>
                    {prizeProduct && (
                      <div className="rounded-2xl p-4 mb-6 flex items-center gap-4 text-left" style={{ background: INK }}>
                        <img
                          src={prizeProduct.image}
                          alt={prizeProduct.title}
                          className="w-20 h-20 rounded-xl object-cover"
                          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                        <div>
                          <p className="text-sm font-bold mb-1">{prizeProduct.title}</p>
                          <p className="font-price text-xs opacity-60 line-through">{formatPrice(prizeProduct.price)}</p>
                          <p className="font-price text-sm font-bold" style={{ color: BRASS }}>
                            {PRIZE_PERCENT}% off → you pay {formatPrice(prizeProduct.price * 0.6)}
                          </p>
                        </div>
                      </div>
                    )}
                    <p className="text-xs opacity-70 mb-6">
                      Show this code to the CEO on WhatsApp or quote it in your next order notes.
                    </p>
                  </>
                ) : (
                  <p className="text-sm opacity-80 mb-6">
                    {endNote ?? 'Contacting the vault…'}
                  </p>
                )}
                <button
                  onClick={playAgain}
                  className="px-8 py-3 rounded-full font-bold text-sm transition-transform hover:scale-105"
                  style={{ background: BRASS, color: INK }}
                >
                  Play again
                </button>
              </div>
            )}

            {(endResult === 'loss' || endResult === 'draw') && (
              <div className="mt-6 rounded-3xl border p-8 text-center" style={{ borderColor: `${BRASS}55`, background: INK_SOFT }}>
                <p className="font-display text-2xl mb-2" style={{ color: BRASS }}>
                  {endResult === 'loss' ? 'Mr George takes the game.' : 'A hard-fought draw.'}
                </p>
                <p className="text-sm italic opacity-80 mb-2">"Good game. Same time next Friday?"</p>
                {endNote && <p className="text-xs opacity-60 mb-2">{endNote}</p>}
                <button
                  onClick={playAgain}
                  className="mt-4 px-8 py-3 rounded-full font-bold text-sm transition-transform hover:scale-105"
                  style={{ background: BRASS, color: INK }}
                >
                  Play again
                </button>
              </div>
            )}
          </section>
        )}

        {/* ---- Tonight's giveaway vault ---- */}
        <section>
          <h3 className="font-display text-xl font-bold mb-3 flex items-center gap-2" style={{ color: BRASS }}>
            <Vault size={20} /> Tonight's giveaway vault
          </h3>
          <p className="text-xs opacity-60 mb-3">Returned treasures, each waiting for a champion at {PRIZE_PERCENT}% off.</p>
          {!supabase ? (
            <p className="text-sm opacity-60">Store offline — the vault is closed for viewing.</p>
          ) : vaultProducts.length === 0 ? (
            <p className="text-sm opacity-60">The vault is empty right now — check back next Friday.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {vaultProducts.map(p => (
                <span
                  key={p.id}
                  className="px-3 py-1.5 rounded-full text-xs font-price"
                  style={{ background: INK_SOFT, border: `1px solid ${BRASS}55`, color: PORCELAIN }}
                >
                  {p.title}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* ---- Hall of Fame ---- */}
        <section>
          <h3 className="font-display text-xl font-bold mb-3 flex items-center gap-2" style={{ color: BRASS }}>
            <Trophy size={20} /> Hall of Fame
          </h3>
          {!supabase ? (
            <p className="text-sm opacity-60">Store offline — the champions' wall is covered tonight.</p>
          ) : !winnersLoaded ? (
            <p className="text-sm opacity-60">Polishing the trophies…</p>
          ) : winners.length === 0 ? (
            <p className="text-sm opacity-70 italic">No champions yet — will you be the first?</p>
          ) : (
            <ul className="space-y-2">
              {winners.map((w, i) => (
                <li
                  key={`${w.playing_name}-${w.created_at}`}
                  className="rounded-2xl px-4 py-3 flex items-center gap-3"
                  style={{ background: INK_SOFT, border: `1px solid ${BRASS}33` }}
                >
                  <span className="font-price text-xs w-6 text-center" style={{ color: BRASS }}>
                    {i + 1}
                  </span>
                  <Crown size={16} color={BRASS} className="shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{w.playing_name}</p>
                    <p className="text-[11px] opacity-60 truncate">
                      {productTitle(w.prize_product_id)} ·{' '}
                      {new Date(w.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <span
                    className="font-price text-[11px] font-bold px-2 py-1 rounded-full shrink-0"
                    style={{ background: ROYAL, color: PORCELAIN }}
                  >
                    {w.prize_percent ?? PRIZE_PERCENT}% off
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
