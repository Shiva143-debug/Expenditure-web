import React from 'react';
import { ChevronRight, Loader2, Plus } from 'lucide-react';
import { formatAmount } from '../utils/format';
import './OverviewCard.css';

const COIN_SRC = './images/rupee.png';

const COIN_SETS = {
  fall: ['coin1', 'coin2', 'coin3'],
  rise: ['coin4', 'coin5', 'coin6'],
  drop: ['coin-drop'],
};

const Coins = ({ variant }) => {
  const coins = COIN_SETS[variant];
  if (!coins) return null;

  return (
    <>
      {coins.map((coin) => (
        <img key={coin} src={COIN_SRC} alt="" aria-hidden="true" className={`card-coin ${coin}`} />
      ))}
    </>
  );
};

/**
 * Compact, config driven summary card.
 * `rows` renders the small label / value pairs under the main amount.
 */
const OverviewCard = ({
  tone = 'earnings',
  icon,
  coins,
  label,
  amount,
  amountLabel,
  rows = [],
  note,
  isLoading = false,
  loadingText = 'Loading...',
  isNegative = false,
  onAddClick,
  onOpen,
  openTitle = 'Open details',
}) => {
  return (
    <article className={`overview-card overview-card--${tone}`}>
      <div className="card-head">
        <div className="card-heading">
          <span className="card-icon">
            {icon}
            <Coins variant={coins} />
          </span>
          <div className="card-summary">
            <h4 className="card-title" title={label}>{label}</h4>
            {isLoading ? (
              <div className="card-loader">
                <Loader2 size={15} className="card-spinner" />
                <span>{loadingText}</span>
              </div>
            ) : (
              <div className={`card-amount ${isNegative ? 'card-amount--negative' : ''}`}>
                <span className="card-currency">₹</span>
                {formatAmount(amount)}
                {amountLabel && <span className="card-amount-label">{amountLabel}</span>}
              </div>
            )}
          </div>
        </div>

        <div className="card-actions">
          {onAddClick && (
            <button type="button" className="card-action" onClick={onAddClick} title={`Add ${label}`} aria-label={`Add ${label}`}>
              <Plus size={13} />
            </button>
          )}
          {onOpen && (
            <button type="button" className="card-action" onClick={onOpen} title={openTitle} aria-label={openTitle}>
              <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>

      {!isLoading && (
        <>
          {rows.length > 0 && (
            <ul className="card-rows">
              {rows.map((row) => (
                <li key={row.label} className="card-row">
                  <span className="card-row-label">{row.label}</span>
                  <span className="card-row-value">{row.value}</span>
                </li>
              ))}
            </ul>
          )}

          {note && <p className="card-note">{note}</p>}
        </>
      )}
    </article>
  );
};

export default OverviewCard;
