export function QueryBuilder({ query, setQuery }) {
  const append = (token) => setQuery((q) => (q ? `${q} ${token}` : token));

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setQuery(e.currentTarget.value);
    }
  };

  return (
    <div className="qb">
      <div className="section-heading">
        <span className="section-heading__number">02</span>
        <div>
          <h2 className="card__title">Build a query</h2>
          <p className="card__description">Combine concepts and locations to find matching studies.</p>
        </div>
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        aria-label="Search query"
        placeholder={'Try: emotion AND [0,-52,26]'}
        className="qb__input w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring"
      />

      <div className="qb__toolbar" aria-label="Query operators">
        {[
          { label: 'AND', onClick: () => append('AND') },
          { label: 'OR', onClick: () => append('OR') },
          { label: 'NOT', onClick: () => append('NOT') },
          { label: '(', onClick: () => append('(') },
          { label: ')', onClick: () => append(')') },
          // Reset moved here after ')' per requirement
          { label: 'Reset', onClick: () => setQuery('') },
        ].map((b) => (
          <button
            key={b.label}
            type="button"
            onClick={b.onClick}
            className={b.label === 'Reset' ? 'button button--quiet' : 'button button--operator'}
          >
            {b.label}
          </button>
        ))}
      </div>

      <p className="qb__tip">Use <b>AND</b>, <b>OR</b>, and <b>NOT</b>. Enter a location as <code>[x,y,z]</code>.</p>
    </div>
  );
}
