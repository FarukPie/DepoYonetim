# Basic Card Component Example

This example demonstrates a standard "Product Card" component following the skill's guidelines.

```jsx
import React from 'react';

const ProductCard = ({ title, price, imageUrl, onAddToCart }) => {
  return (
    <div className="group relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-slate-100">
      {/* Image Container */}
      <div className="aspect-video w-full overflow-hidden bg-slate-200">
        <img 
          src={imageUrl} 
          alt={title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-semibold text-slate-800 mb-2 truncate">
          {title}
        </h3>
        <p className="text-emerald-600 font-bold text-xl mb-4">
          ${price.toFixed(2)}
        </p>

        <button 
          onClick={onAddToCart}
          className="w-full py-2.5 px-4 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
```
