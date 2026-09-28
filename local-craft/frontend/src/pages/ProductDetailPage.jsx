import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productService } from '../services/product.service';
import { useAuth } from '../hooks/useAuth';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await productService.getById(id);
        if (res.success) {
          setProduct(res.data);
        }
      } catch (err) {
        setError('Không tìm thấy thông tin sản phẩm hoặc đã xảy ra lỗi.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleOrder = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/products/${id}` } } });
      return;
    }
    // Navigate to orders with selected item state
    navigate('/orders', { state: { directBuy: { product, quantity } } });
  };

  if (loading) return <div className="section-container"><p>Đang tải chi tiết sản phẩm...</p></div>;
  if (error || !product) return <div className="section-container"><p className="alert alert-error">{error || 'Không tìm thấy sản phẩm'}</p></div>;

  return (
    <div className="section-container">
      <div className="detail-layout">
        <div className="detail-main">
          <div className="detail-image-box">
            {product.images?.[0] ? (
              <img src={product.images[0]} alt={product.name} />
            ) : (
              <div className="detail-placeholder">🏺 {product.name}</div>
            )}
          </div>
          <h1>{product.name}</h1>
          <p className="detail-category">Danh mục: <strong>{product.category?.name || 'Thủ công mỹ nghệ'}</strong></p>
          <div className="detail-description">
            <h3>Mô tả sản phẩm</h3>
            <p>{product.description}</p>
          </div>
        </div>

        <div className="detail-sidebar">
          <div className="booking-card">
            <div className="price-display">
              <span className="amount">{product.price?.toLocaleString('vi-VN')} đ</span>
            </div>

            <ul className="workshop-specs">
              <li>📦 <strong>Tình trạng:</strong> {product.stock > 0 ? `Còn hàng (${product.stock} sản phẩm)` : 'Hết hàng'}</li>
              <li>🏷️ <strong>Trạng thái:</strong> {product.status}</li>
            </ul>

            <div className="quantity-selector">
              <label>Số lượng:</label>
              <input
                type="number"
                min="1"
                max={product.stock || 1}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              />
            </div>

            <div className="artisan-info-card">
              <h4>Chế tác bởi</h4>
              <p><strong>{product.artisan?.studioName || 'Xưởng thủ công'}</strong></p>
              <p>Nghệ nhân: {product.artisan?.user?.name || 'Nghệ nhân bản địa'}</p>
              {product.artisan?._id && (
                <Link to={`/artisans/${product.artisan._id}`} className="link-artisan">
                  Xem hồ sơ nghệ nhân →
                </Link>
              )}
            </div>

            <button
              onClick={handleOrder}
              className="btn btn-primary btn-block btn-large"
              disabled={product.stock <= 0}
            >
              {product.stock > 0 ? 'Đặt mua sản phẩm' : 'Sản phẩm tạm hết hàng'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
