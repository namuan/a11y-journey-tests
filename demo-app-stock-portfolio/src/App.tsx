import { useMemo, useRef, useState, type FormEvent } from 'react';

type Holding = {
  symbol: string;
  name: string;
  shares: number;
  price: number;
  movement: number;
};

type TradeSide = 'Buy' | 'Sell';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const initialHoldings: Holding[] = [
  { symbol: 'VTI', name: 'Total Market ETF', shares: 12, price: 275.21, movement: 1.42 },
  { symbol: 'MSFT', name: 'Microsoft Corporation', shares: 4, price: 420.18, movement: -0.36 },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', shares: 8, price: 118.75, movement: 2.18 },
];

function App() {
  const [holdings, setHoldings] = useState(initialHoldings);
  const [cash, setCash] = useState(1250);
  const [symbol, setSymbol] = useState('VTI');
  const [side, setSide] = useState<TradeSide>('Buy');
  const [sharesInput, setSharesInput] = useState('1');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  const selectedHolding = holdings.find((holding) => holding.symbol === symbol)!;
  const portfolioValue = useMemo(
    () => holdings.reduce((total, holding) => total + holding.shares * holding.price, 0),
    [holdings],
  );
  const accountValue = portfolioValue + cash;
  const shareCount = Number(sharesInput);
  const tradeValue = Number.isFinite(shareCount) && shareCount > 0 ? shareCount * selectedHolding.price : 0;

  function validateTrade() {
    const quantity = Number(sharesInput);
    if (!Number.isInteger(quantity) || quantity < 1) return 'Enter a whole number of shares greater than zero.';
    if (side === 'Sell' && quantity > selectedHolding.shares) return `You can sell up to ${selectedHolding.shares} shares of ${symbol}.`;
    if (side === 'Buy' && tradeValue > cash) return 'This order is greater than your available cash.';
    return '';
  }

  async function submitTrade(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('');
    const validationError = validateTrade();
    setError(validationError);
    if (validationError) {
      requestAnimationFrame(() => errorSummaryRef.current?.focus());
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, side, shares: shareCount, estimatedValue: tradeValue }),
      });
      if (!response.ok) throw new Error('Trade request failed');
      const result = (await response.json()) as { reference: string };
      setHoldings((current) => current.map((holding) => holding.symbol === symbol
        ? { ...holding, shares: holding.shares + (side === 'Buy' ? shareCount : -shareCount) }
        : holding));
      setCash((current) => current + (side === 'Buy' ? -tradeValue : tradeValue));
      setStatus(`${side} order placed for ${shareCount} ${shareCount === 1 ? 'share' : 'shares'} of ${symbol}. Reference ${result.reference}.`);
      setError('');
    } catch {
      setStatus('We could not place your order. Your trade details are still here. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="portfolio-shell">
      <header className="topbar">
        <a className="brand" href="#home"><span className="brand-icon" aria-hidden="true">C</span><span>Common Ledger</span></a>
        <nav aria-label="Main navigation"><a href="#portfolio">Portfolio</a><a href="#trade">Trade</a></nav>
        <span className="account-label"><span className="online-dot" aria-hidden="true" /> Mock account</span>
      </header>

      <main id="home" className="dashboard">
        <div className="page-title">
          <div><p className="eyebrow">Monday, October 20</p><h1>Your portfolio</h1><p className="page-intro">A clear view of your investments, all in one place.</p></div>
          <span className="market-pill"><span aria-hidden="true">●</span> Market data is simulated</span>
        </div>

        <section className="overview-grid" aria-label="Portfolio overview">
          <article className="metric-card primary-metric"><p className="metric-label">Total account value</p><p className="metric-value">{currency.format(accountValue)}</p><p className="metric-detail">Mock portfolio balance</p></article>
          <article className="metric-card"><p className="metric-label">Invested</p><p className="metric-value">{currency.format(portfolioValue)}</p><p className="metric-detail">Across {holdings.length} holdings</p></article>
          <article className="metric-card"><p className="metric-label">Available cash</p><p className="metric-value">{currency.format(cash)}</p><p className="metric-detail">Available to invest</p></article>
        </section>

        <div className="content-grid">
          <section className="holdings-card" id="portfolio" aria-labelledby="holdings-heading">
            <div className="card-heading"><div><p className="eyebrow">Your investments</p><h2 id="holdings-heading">Holdings</h2></div><span className="holding-count">{holdings.length} positions</span></div>
            <div className="table-scroll">
              <table>
                <caption className="visually-hidden">Current investment holdings and market values</caption>
                <thead><tr><th scope="col">Investment</th><th scope="col">Shares</th><th scope="col">Price</th><th scope="col">Market value</th><th scope="col">Daily change</th></tr></thead>
                <tbody>
                  {holdings.map((holding) => (
                    <tr key={holding.symbol}>
                      <th scope="row"><span className="ticker">{holding.symbol}</span><span className="company-name">{holding.name}</span></th>
                      <td>{holding.shares}</td>
                      <td>{currency.format(holding.price)}</td>
                      <td className="value-cell">{currency.format(holding.shares * holding.price)}</td>
                      <td className={holding.movement >= 0 ? 'positive' : 'negative'}>{holding.movement >= 0 ? '+' : ''}{holding.movement.toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="table-note">Prices and balances are illustrative mock data, not investment advice.</p>
          </section>

          <aside className="trade-card" id="trade" aria-labelledby="trade-heading">
            <div className="card-heading"><div><p className="eyebrow">Place an order</p><h2 id="trade-heading">Trade</h2></div><span className="trade-mark" aria-hidden="true">↗</span></div>
            <form onSubmit={submitTrade} noValidate>
              {error && <div className="error-summary" role="alert" tabIndex={-1} ref={errorSummaryRef}><h3>Check your order</h3><p>{error}</p></div>}

              <fieldset className="side-choice">
                <legend>Order type</legend>
                <div className="side-options">
                  {(['Buy', 'Sell'] as const).map((value) => (
                    <label className="side-option" key={value}>
                      <input type="radio" name="side" value={value} checked={side === value} onChange={() => { setSide(value); setError(''); }} />
                      <span>{value}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="form-field">
                <label htmlFor="symbol">Investment</label>
                <select id="symbol" value={symbol} onChange={(event) => { setSymbol(event.target.value); setError(''); }}>
                  {holdings.map((holding) => <option value={holding.symbol} key={holding.symbol}>{holding.symbol} — {holding.name}</option>)}
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="shares">Number of shares</label>
                <input id="shares" type="number" min="1" step="1" inputMode="numeric" value={sharesInput} aria-invalid={Boolean(error)} aria-describedby={error ? 'shares-error' : 'shares-hint'} onChange={(event) => { setSharesInput(event.target.value); setError(''); }} />
                {error ? <p className="field-error" id="shares-error">{error}</p> : <p className="field-hint" id="shares-hint">Whole shares only. You own {selectedHolding.shares} {symbol} shares.</p>}
              </div>

              <div className="order-estimate"><span>Estimated order value</span><strong>{currency.format(tradeValue)}</strong></div>
              <button className="submit-button" type="submit" disabled={submitting}>{submitting ? 'Placing order…' : `Review ${side.toLowerCase()} order`}<span aria-hidden="true">→</span></button>
              <p className="mock-note">Orders are simulated. No brokerage account or external service is connected.</p>
              <p className="submission-status" role="status" aria-live="polite">{status}</p>
            </form>
          </aside>
        </div>
      </main>
      <footer className="footer"><span>Common Ledger</span><span>Demo portfolio · No real assets or transactions</span></footer>
    </div>
  );
}

export default App;
