import React from 'react';
// import { Wallet, ShoppingCart, PiggyBank, TrendingUp } from 'lucide-react';
import { IndianRupee, TrendingDown, PiggyBank, TrendingUp, ChevronRight, Loader2 } from 'lucide-react';
import './OverviewCard.css';

const OverviewCard = ({ type, amount, label, secondaryAmount, expenseAmount, secondaryLabel, expenseLabel, onAddClick, onShowYearWiseData, onArrowClick, hideArrow, isLoading, loadingText }) => {


  const getIcon = () => {
    switch (type) {
      case 'earnings':
        return (
          <div className="icon-anim earnings-anim">
            <IndianRupee size={40} />
            <img src="./images/rupee.png" className="coin-img coin1" />
            <img src="./images/rupee.png" className="coin-img coin2" />
            <img src="./images/rupee.png" className="coin-img coin3" />
          </div>
        );

      case 'expenses':
        return (
          <div className="icon-anim expenses-anim">
            <TrendingDown size={40} />
            <img src="./images/rupee.png" className="coin-out coin4" />
            <img src="./images/rupee.png" className="coin-out coin5" />
            <img src="./images/rupee.png" className="coin-out coin6" />
          </div>
        );

      case 'savings':
        return (
          <div className="icon-anim savings-anim">
            <PiggyBank size={40} />
            <img src="./images/rupee.png" className="coin-drop" />
          </div>
        );

      case 'yearly':
        return (
          <div className="icon-anim yearly-anim">
            <TrendingUp size={40} />
          </div>
        );

      default:
        return <IndianRupee size={40} />;
    }
  };

  const getGradient = () => {
    switch (type) {
      case 'earnings':
        return 'earnings-gradient';
      case 'expenses':
        return 'expenses-gradient';
      case 'savings':
        return 'savings-gradient';
      case 'yearly':
        return 'yearly-gradient';
      default:
        return 'earnings-gradient';
    }
  };

  const showYearData =()=>{
    onShowYearWiseData && onShowYearWiseData()
  }

  return (
    <div className={`overview-card px-5 ${getGradient()}`} onClick={showYearData}>

      {type !== "yearly" && onAddClick && (
        <div className="add-btn-container">
          <button
            className={`add-btn ${type}`}
            onClick={(e) => {
              e.stopPropagation();
              onAddClick();
            }}
          >
            +
          </button>
          {type === 'expenses' && onArrowClick && !hideArrow && (
            <button
              className="arrow-btn"
              onClick={(e) => {
                e.stopPropagation();
                onArrowClick();
              }}
            >
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      )}
      {type === "yearly" && onShowYearWiseData && !hideArrow && (
        <button
          className="yearly-arrow-btn"
          onClick={(e) => {
            e.stopPropagation();
            onShowYearWiseData();
          }}
        >
          <ChevronRight size={20} />
        </button>
      )}
      {/* card-icon */}
      <div className="card-icon">
        {getIcon()}
      </div>
      <div className="card-content">
        <h4 className="card-title">{label}</h4>
        <hr />
        {isLoading ? (
          <div className="card-loader">
            <div className="loader-top">
              <Loader2 className="loading-spinner" size={20} />
              <span>{loadingText || "Fetching data..."}</span>
            </div>
            <div className="loader-bars">
              <div className="loader-bar short" />
              <div className="loader-bar long" />
              <div className="loader-bar medium" />
            </div>
          </div>
        ) : (
          <>
            <div className="card-amount">₹ {amount.toLocaleString('en-IN')}{label === "Yearly Overview" && <span className="secondary-label"> EARNINGS</span>}</div>
            {expenseAmount && (
              <div>
                <span className="card-amount">₹ {expenseAmount.toLocaleString('en-IN')}<span className="secondary-label"> {expenseLabel}</span> </span>
              </div>
            )}
            {secondaryAmount && (
              <div>
                <span className="card-amount">₹ {secondaryAmount.toLocaleString('en-IN')}<span className="secondary-label"> {secondaryLabel}</span> </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OverviewCard;
