import React from 'react';
import {
  Wallet, Briefcase, Home, Utensils, Car, ShoppingBag,
  Zap, Tv, MoreHorizontal, Shield, TrendingUp, Plane,
  ShoppingCart, Fuel, Film, Dumbbell, Wifi, ChevronRight
} from 'lucide-react';
import './InfoCard.css';

const iconMap = {
  'wallet': <Wallet size={18} />, 'briefcase': <Briefcase size={18} />, 'home': <Home size={18} />,
  'utensils': <Utensils size={18} />, 'car': <Car size={18} />, 'shopping-bag': <ShoppingBag size={18} />,
  'zap': <Zap size={18} />, 'tv': <Tv size={18} />, 'more-horizontal': <MoreHorizontal size={18} />,
  'shield': <Shield size={18} />, 'trending-up': <TrendingUp size={18} />, 'plane': <Plane size={18} />,
  'shopping-cart': <ShoppingCart size={18} />, 'fuel': <Fuel size={18} />, 'film': <Film size={18} />,
  'dumbbell': <Dumbbell size={18} />, 'wifi': <Wifi size={18} />,
};

const colorMap = {
  'wallet': '#4facfe', 'briefcase': '#00d9ff', 'home': '#ff6b00', 'utensils': '#ffd700',
  'car': '#00ff96', 'shopping-bag': '#ff1493', 'zap': '#00d4ff', 'tv': '#8a2be2',
  'more-horizontal': '#ff69b4', 'shield': '#32cd32', 'trending-up': '#4facfe',
  'plane': '#ff8c00', 'shopping-cart': '#ffd700', 'fuel': '#00ff96', 'film': '#ff1493',
  'dumbbell': '#00d4ff', 'wifi': '#8a2be2',
};

const InfoCard = ({ title, children, gridColumn, addButton, noButton, onAddClick, height, onViewAllClick }) => {
  const childrenArray = React.Children.toArray(children);

  const otherChildren = childrenArray.filter(child => !(child.type === 'button' && child.props.className === 'add-button'));
  const addButtonChild = childrenArray.find(child => child.type === 'button' && child.props.className === 'add-button');

  const hasMoreThanFour = otherChildren.length > 4;
  const displayedItems = hasMoreThanFour ? otherChildren.slice(0, 4) : otherChildren;

  return (
    <div className="info-card" style={{ gridColumn, height }}>
      <div className="info-card-header">
        <h2 className="info-card-title">{title}</h2>
        {title !== 'Recent Expenses' && onAddClick && <button className="info-add-btn" onClick={onAddClick}> +</button>}
      </div>

      <div className="info-card-content">
        {displayedItems}
      </div>

      {hasMoreThanFour && (
        <button className="view-all-button" onClick={onViewAllClick}>View All</button>
      )}

      {addButtonChild}

      {addButton && !noButton && (
        <button className="add-button" onClick={onAddClick}>
          {addButton}
        </button>
      )}
    </div>
  );
};

export const InfoItem = ({ icon, name, expenseName, amount, percentage, hasArrow }) => {
  const color = colorMap[icon] || '#4facfe';

  return (
    <div className="info-item">
      <div className="info-item-left">
        <div className="info-item-icon" style={{ backgroundColor: `${color}22`, color }}>
          {iconMap[icon] || <Wallet size={18} />}
        </div>
        <span className="info-item-name">{name}</span>
        {expenseName && <span className="info-item-name">({expenseName})</span>}
      </div>
      <div className="info-item-right">
        {percentage !== undefined && <span className="info-item-percentage">{percentage}%</span>}
        {hasArrow && <ChevronRight size={16} className="info-item-arrow" />}
      </div>
    </div>
  );
};

export default InfoCard;
