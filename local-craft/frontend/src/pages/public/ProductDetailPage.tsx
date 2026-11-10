import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Star, Minus, Plus, ShoppingCart, MapPin } from 'lucide-react';
import { products } from '../../utils/mockData';
import { formatCurrencyShort } from '../../utils/formatCurrency';
import { useCart } from '../../hooks/useCart';
import Button from '../../components/common/Button';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);

  const product = products.find((p) => p._id === id);
  if (!product) return <div className="text-center py-20">Không tìm thấy sản phẩm</div>;

  return (
    <div className="max-w-[1280px] mx-auto px-5 md:px-8 lg:px-16 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="rounded-2xl overflow-hidden">
          <img src={product.images[0]} alt={product.name} className="w-full h-[500px] object-cover" />
        </div>
        <div>
          <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">{product.category}</span>
          <h1 className="font-headline-lg text-headline-md text-deep-earth mt-4 mb-3">{product.name}</h1>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex">{[...Array(Math.round(product.rating ?? 0))].map((_, i) => <Star key={i} size={16} className="text-amber-500 fill-amber-500" />)}</div>
            <span className="text-sm text-on-surface-variant">{product.rating} ({product.totalReviews} đánh giá)</span>
          </div>
          <p className="text-3xl font-bold text-primary mb-6">{formatCurrencyShort(product.price)}</p>
          <p className="text-on-surface-variant leading-relaxed mb-8">{product.description}</p>
          <div className="flex items-center gap-2 text-sm text-on-surface-variant mb-6"><MapPin size={16} /> Nghệ nhân: {product.hostName}</div>
          <div className="flex items-center gap-4 mb-6">
            <span className="text-sm font-medium">Số lượng:</span>
            <div className="flex items-center gap-2 border rounded-xl px-2">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-2"><Minus size={16} /></button>
              <span className="w-8 text-center font-medium">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="p-2"><Plus size={16} /></button>
            </div>
            <span className="text-xs text-on-surface-variant">Còn {product.stock} sản phẩm</span>
          </div>
          <div className="flex gap-3">
            <Button size="lg" onClick={() => { for (let i = 0; i < qty; i++) addToCart(product); }}>
              <ShoppingCart size={18} className="mr-2" /> Thêm vào giỏ hàng
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
