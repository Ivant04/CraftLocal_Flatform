import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../services/product.service';

export const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchProducts = async (keyword = '') => {
    setLoading(true);
    try {
      const res = await productService.getAll({ search: keyword });
      if (res.success) {
        setProducts(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts(search);
  };

  return (
    <div className="section-container">
      <div className="page-header">
        <h1>Sản phẩm Thủ công Mỹ nghệ</h1>
        <p>Các tác phẩm gốm sứ, đồ mây tre đan, tranh sơn mài và quà lưu niệm thủ công do nghệ nhân chế tác.</p>
      </div>

      <div className="filter-bar">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm theo tên, mô tả..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">Tìm kiếm</button>
        </form>
      </div>

      {loading ? (
        <p className="loading-text">Đang tải danh sách sản phẩm...</p>
      ) : products.length > 0 ? (
        <div className="card-grid">
          {products.map((p) => (
            <div key={p._id} className="card item-card">
              <div className="card-image-placeholder">
                {p.images?.[0] ? <img src={p.images[0]} alt={p.name} /> : <span>🏺</span>}
              </div>
              <div className="card-body">
                <span className="card-badge">{p.category?.name || 'Thủ công'}</span>
                <h3>{p.name}</h3>
                <p className="card-artisan">
                  Nghệ nhân: {p.artisan?.user?.name || p.artisan?.studioName || 'Bản địa'}
                </p>
                <p className="card-desc">{p.description?.slice(0, 90)}...</p>
                <div className="card-meta">
                  <span>Kho: {p.stock}</span>
                  <span className="stock-status">{p.stock > 0 ? 'Còn hàng' : 'Hết hàng'}</span>
                </div>
                <div className="card-footer">
                  <span className="price-tag">{p.price?.toLocaleString('vi-VN')} đ</span>
                  <Link to={`/products/${p._id}`} className="btn btn-primary">
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>Hiện chưa có sản phẩm nào được đăng bán.</p>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
