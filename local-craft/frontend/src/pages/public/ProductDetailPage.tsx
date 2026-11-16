import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Star, Minus, Plus, ShoppingCart, MapPin, ShieldCheck, 
  Truck, RotateCcw, PackageCheck, ChevronRight, Heart, Share2, Sparkles, AlertCircle
} from 'lucide-react';
import { products } from '../../utils/mockData';
import { formatCurrencyShort } from '../../utils/formatCurrency';
import { useCart } from '../../hooks/useCart';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import RatingStars from '../../components/common/RatingStars';
import ProductCard from '../../components/home/ProductCard';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [qty, setQty] = useState<number>(1);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [addedToast, setAddedToast] = useState<boolean>(false);

  const product = products.find((p) => p._id === id);
  if (!product) {
    return (
      <div className="max-w-[1280px] mx-auto px-5 py-24 text-center">
        <h2 className="text-2xl font-headline font-bold text-deep-earth mb-2">Không tìm thấy sản phẩm</h2>
        <p className="text-on-surface-variant mb-6">Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã hết hàng.</p>
        <Link to="/products">
          <Button variant="primary">Khám phá sản phẩm khác</Button>
        </Link>
      </div>
    );
  }

  const relatedProducts = products
    .filter((p) => p._id !== id && p.category === product.category)
    .slice(0, 4);

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) {
      addToCart(product);
    }
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  const images = product.images?.length > 0 
    ? product.images 
    : ['/src/assets/images/ceramics.jpg'];

  return (
    <div className="min-h-screen bg-surface-warm pb-20">
      {/* Toast Notification */}
      {addedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-deep-earth text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-fade-in border border-outline-variant/30">
          <div className="w-6 h-6 rounded-full bg-forest text-white flex items-center justify-center shrink-0">
            ✓
          </div>
          <div className="text-xs">
            <p className="font-bold">Đã thêm vào giỏ hàng!</p>
            <p className="text-white/80">{qty} × {product.name}</p>
          </div>
          <Link to="/cart" className="ml-2 text-xs font-bold text-accent-gold underline">
            Xem giỏ
          </Link>
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <div className="border-b border-outline-subtle bg-white/60">
        <div className="max-w-[1280px] mx-auto px-5 md:px-8 py-3.5 flex items-center justify-between text-xs md:text-sm text-on-surface-variant">
          <div className="flex items-center gap-2 overflow-hidden">
            <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
            <ChevronRight size={14} className="opacity-50 shrink-0" />
            <Link to="/products" className="hover:text-primary transition-colors">Sản phẩm thủ công</Link>
            <ChevronRight size={14} className="opacity-50 shrink-0" />
            <span className="text-deep-earth font-medium truncate max-w-[200px] md:max-w-[400px]">
              {product.name}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button 
              onClick={() => setIsLiked(!isLiked)} 
              className={`p-2 rounded-full border border-outline-variant hover:border-primary/50 transition-colors ${isLiked ? 'text-rose-600 bg-rose-50' : 'text-on-surface-variant hover:text-primary'}`}
              title="Lưu vào danh sách yêu thích"
            >
              <Heart size={16} className={isLiked ? 'fill-rose-600' : ''} />
            </button>
            <button 
              onClick={() => navigator.clipboard?.writeText(window.location.href)}
              className="p-2 rounded-full border border-outline-variant hover:border-primary/50 transition-colors text-on-surface-variant hover:text-primary"
              title="Chia sẻ liên kết"
            >
              <Share2 size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-5 md:px-8 lg:px-12 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
          {/* Left Column: Product Imagery */}
          <div className="space-y-4">
            <div className="aspect-square rounded-3xl overflow-hidden bg-white border border-outline-subtle relative group shadow-xs">
              <img 
                src={images[activeImageIndex] || images[0]} 
                alt={product.name} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-4 left-4">
                <Badge variant="heritage" size="sm">
                  Thủ công truyền thống
                </Badge>
              </div>
            </div>

            {/* Thumbnail Row */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      activeImageIndex === idx ? 'border-primary ring-2 ring-primary/20 scale-95' : 'border-transparent opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Trust highlights */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-white rounded-2xl border border-outline-subtle text-center text-xs">
              <div className="p-2">
                <ShieldCheck size={22} className="mx-auto text-forest mb-1.5" />
                <span className="font-bold text-deep-earth block">100% Tinh xảo</span>
                <span className="text-[11px] text-on-surface-variant">Chế tác thủ công</span>
              </div>
              <div className="p-2 border-x border-outline-subtle">
                <Truck size={22} className="mx-auto text-primary mb-1.5" />
                <span className="font-bold text-deep-earth block">Giao an toàn</span>
                <span className="text-[11px] text-on-surface-variant">Đóng gói chống sốc</span>
              </div>
              <div className="p-2">
                <RotateCcw size={22} className="mx-auto text-accent-amber mb-1.5" />
                <span className="font-bold text-deep-earth block">Bảo hiểm vỡ</span>
                <span className="text-[11px] text-on-surface-variant">Đổi mới nếu lỗi vận chuyển</span>
              </div>
            </div>
          </div>

          {/* Right Column: Product Info & Purchase Form */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="subtle" size="sm">{product.category}</Badge>
              <span className="text-xs text-on-surface-variant">Mã SP: {product._id.slice(-6).toUpperCase()}</span>
            </div>

            <h1 className="font-headline text-2xl md:text-3xl lg:text-4xl font-bold text-deep-earth leading-snug mb-3">
              {product.name}
            </h1>

            {/* Rating & Artisan */}
            <div className="flex items-center gap-3 pb-4 border-b border-outline-subtle mb-5 text-sm">
              <div className="flex items-center gap-1.5">
                <RatingStars rating={product.rating || 5} size={15} />
                <span className="font-bold text-deep-earth">{product.rating?.toFixed(1) || '5.0'}</span>
                <span className="text-xs text-on-surface-variant">({product.totalReviews || 12} đánh giá)</span>
              </div>
              <span className="w-1 h-1 rounded-full bg-outline-variant" />
              <div className="flex items-center gap-1 text-xs text-on-surface-variant">
                <MapPin size={14} className="text-primary" />
                <span>Nghệ nhân: <strong className="text-deep-earth">{product.hostName || 'Làng nghề'}</strong></span>
              </div>
            </div>

            {/* Price section */}
            <div className="p-5 rounded-2xl bg-surface-container/60 border border-outline-subtle mb-6">
              <span className="text-xs uppercase tracking-wider text-on-surface-variant font-medium">Giá sản phẩm</span>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-3xl md:text-4xl font-extrabold text-primary font-headline">
                  {formatCurrencyShort(product.price)}
                </span>
                <span className="text-xs text-forest font-semibold bg-forest-50 px-2.5 py-1 rounded-full border border-forest/20">
                  Đã bao gồm VAT & Hộp quà
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-deep-earth mb-2">Mô tả tác phẩm</h3>
              <p className="text-on-surface-variant text-sm md:text-base leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Stock status & quantity stepper */}
            <div className="mb-8 pt-6 border-t border-outline-subtle">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-deep-earth">Số lượng mua</span>
                <span className={`text-xs font-semibold ${product.stock > 0 ? 'text-forest' : 'text-rose-600'}`}>
                  {product.stock > 0 ? `Còn sẵn ${product.stock} tác phẩm tại xưởng` : 'Tạm hết hàng'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center border border-outline-variant rounded-xl bg-white p-1">
                  <button 
                    type="button"
                    onClick={() => setQty(Math.max(1, qty - 1))} 
                    disabled={qty <= 1}
                    className="w-9 h-9 rounded-lg hover:bg-surface-warm flex items-center justify-center text-deep-earth transition-colors disabled:opacity-30"
                  >
                    <Minus size={15} />
                  </button>
                  <span className="w-12 text-center font-bold text-deep-earth text-base">{qty}</span>
                  <button 
                    type="button"
                    onClick={() => setQty(Math.min(product.stock, qty + 1))} 
                    disabled={qty >= product.stock}
                    className="w-9 h-9 rounded-lg hover:bg-surface-warm flex items-center justify-center text-deep-earth transition-colors disabled:opacity-30"
                  >
                    <Plus size={15} />
                  </button>
                </div>

                <div className="text-xs text-on-surface-variant">
                  Tổng: <strong className="text-primary font-bold text-sm">{formatCurrencyShort(product.price * qty)}</strong>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-auto">
              <Button 
                variant="outline" 
                size="lg" 
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="py-3.5 font-bold"
              >
                <ShoppingCart size={18} className="mr-2" />
                Thêm vào giỏ hàng
              </Button>
              <Button 
                variant="primary" 
                size="lg" 
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                className="py-3.5 font-bold shadow-md"
              >
                Mua ngay
              </Button>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-24 pt-12 border-t border-outline-subtle">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs uppercase tracking-wider text-primary font-bold">Khám phá thêm</span>
                <h3 className="font-headline text-2xl font-bold text-deep-earth mt-1">Sản phẩm thủ công cùng thể loại</h3>
              </div>
              <Link to="/products" className="text-xs md:text-sm font-semibold text-primary hover:underline">
                Xem toàn bộ cửa hàng →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
