import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  ShoppingBag,
  Layers,
  Archive,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import productApi from '../../api/productApi';
import { normalizeProduct } from '../../utils/normalizers';
import type { Product } from '../../types/product.type';
import { formatCurrencyShort } from '../../utils/formatCurrency';
import Button from '../../components/common/Button';
import ImageWithFallback from '../../components/common/ImageWithFallback';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';

const ManageProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'IN_STOCK' | 'OUT_OF_STOCK'>('ALL');
  const [busyId, setBusyId] = useState<string | null>(null);

  // Modal delete state
  const [targetProduct, setTargetProduct] = useState<Product | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await productApi.getByHost();
      const list = res.data?.data;
      setProducts(Array.isArray(list) ? list.map(normalizeProduct) : []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể tải danh sách sản phẩm.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleOpenDelete = (p: Product) => {
    setTargetProduct(p);
    setIsDeleteModalOpen(true);
  };

  const handleExecuteDelete = async () => {
    if (!targetProduct) return;
    setDeleteLoading(true);
    try {
      await productApi.delete(targetProduct._id);
      setProducts((prev) => prev.filter((item) => item._id !== targetProduct._id));
      setToastMessage({
        type: 'success',
        text: `Đã xóa sản phẩm "${targetProduct.name}"`,
      });
      setIsDeleteModalOpen(false);
    } catch (err: any) {
      setToastMessage({
        type: 'error',
        text: err?.response?.data?.message || 'Xóa sản phẩm thất bại.',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  // Stats
  const stats = useMemo(() => {
    const total = products.length;
    const inStock = products.filter((p) => p.stock > 0).length;
    const outOfStock = products.filter((p) => p.stock <= 0).length;
    const totalValuation = products.reduce((acc, p) => acc + p.price * p.stock, 0);
    return { total, inStock, outOfStock, totalValuation };
  }, [products]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        !searchTerm.trim() ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStock =
        stockFilter === 'ALL' ||
        (stockFilter === 'IN_STOCK' && p.stock > 0) ||
        (stockFilter === 'OUT_OF_STOCK' && p.stock <= 0);
      return matchSearch && matchStock;
    });
  }, [products, searchTerm, stockFilter]);

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3.5 rounded-2xl shadow-xl border text-sm font-semibold transition-all animate-in fade-in slide-in-from-bottom-3 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-900/95 text-white border-emerald-700'
              : 'bg-rose-900/95 text-white border-rose-700'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          ) : (
            <XCircle size={18} className="text-rose-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#964824]">
            Kênh Quản lý Xưởng
          </span>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#3D2B1F] mt-1">
            Quản lý sản phẩm thủ công
          </h1>
          <p className="text-xs md:text-sm text-[#7A6255] mt-1">
            Đăng bán, cập nhật giá và kiểm kê tồn kho các tác phẩm thủ công của xưởng.
          </p>
        </div>
        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={fetchProducts}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-[#7A6255] bg-white border border-[#EAD8CC] hover:bg-[#FAF7F2] hover:text-[#964824] rounded-xl transition-all cursor-pointer shadow-xs"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Làm mới</span>
          </button>
          <Link to="/host/products/create">
            <Button size="sm" className="inline-flex items-center gap-1.5 shadow-sm">
              <Plus size={16} />
              <span>Thêm sản phẩm</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl border border-[#EAD8CC] p-4 hover:shadow-[0_4px_20px_rgba(61,43,31,0.06)] transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#964824] text-white flex items-center justify-center shrink-0">
              <ShoppingBag size={20} />
            </div>
            <div>
              <p className="text-xs text-[#7A6255] font-medium">Tổng sản phẩm</p>
              <p className="text-xl font-bold text-[#3D2B1F] tracking-tight">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#EAD8CC] p-4 hover:shadow-[0_4px_20px_rgba(61,43,31,0.06)] transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-xs text-[#7A6255] font-medium">Đang còn hàng</p>
              <p className="text-xl font-bold text-[#3D2B1F] tracking-tight">{stats.inStock}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#EAD8CC] p-4 hover:shadow-[0_4px_20px_rgba(61,43,31,0.06)] transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
              <Archive size={20} />
            </div>
            <div>
              <p className="text-xs text-[#7A6255] font-medium">Đã hết hàng</p>
              <p className="text-xl font-bold text-[#3D2B1F] tracking-tight">{stats.outOfStock}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#EAD8CC] p-4 hover:shadow-[0_4px_20px_rgba(61,43,31,0.06)] transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0">
              <Layers size={20} />
            </div>
            <div>
              <p className="text-xs text-[#7A6255] font-medium">Giá trị tồn kho</p>
              <p className="text-xl font-bold text-[#3D2B1F] tracking-tight">
                {formatCurrencyShort(stats.totalValuation)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Card: Search, Filter & Table */}
      <div className="bg-white rounded-2xl border border-[#EAD8CC] overflow-hidden shadow-xs">
        {/* Controls Bar */}
        <div className="p-4 md:p-5 border-b border-[#EAD8CC] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-xs">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A6255]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên sản phẩm, danh mục..."
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-[#FAF7F2] border border-[#EAD8CC] rounded-xl text-[#3D2B1F] placeholder-[#7A6255]/70 focus:outline-none focus:border-[#964824] focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <button
              onClick={() => setStockFilter('ALL')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                stockFilter === 'ALL'
                  ? 'bg-[#964824] text-white shadow-xs'
                  : 'bg-[#FAF7F2] text-[#7A6255] hover:bg-[#F2E8DF] hover:text-[#3D2B1F]'
              }`}
            >
              Tất cả ({products.length})
            </button>
            <button
              onClick={() => setStockFilter('IN_STOCK')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                stockFilter === 'IN_STOCK'
                  ? 'bg-[#964824] text-white shadow-xs'
                  : 'bg-[#FAF7F2] text-[#7A6255] hover:bg-[#F2E8DF] hover:text-[#3D2B1F]'
              }`}
            >
              Còn hàng ({stats.inStock})
            </button>
            <button
              onClick={() => setStockFilter('OUT_OF_STOCK')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                stockFilter === 'OUT_OF_STOCK'
                  ? 'bg-[#964824] text-white shadow-xs'
                  : 'bg-[#FAF7F2] text-[#7A6255] hover:bg-[#F2E8DF] hover:text-[#3D2B1F]'
              }`}
            >
              Hết hàng ({stats.outOfStock})
            </button>
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div className="m-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Table / Empty State / Loading */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <Loading />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16">
            <EmptyState
              title="Không có sản phẩm nào"
              description="Chưa có sản phẩm nào phù hợp với bộ lọc hoặc bạn chưa tạo sản phẩm nào."
              icon={<ShoppingBag size={44} className="text-[#964824] opacity-50" />}
              action={
                <Link to="/host/products/create">
                  <Button size="sm">
                    <Plus size={16} className="mr-1" /> Tạo sản phẩm đầu tiên
                  </Button>
                </Link>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="border-b border-[#EAD8CC] bg-[#FAF7F2]/80 text-[#7A6255] font-semibold">
                  <th className="py-3.5 px-4 md:px-6">Tác phẩm / Sản phẩm</th>
                  <th className="py-3.5 px-4">Đơn giá</th>
                  <th className="py-3.5 px-4">Tồn kho</th>
                  <th className="py-3.5 px-4">Trạng thái</th>
                  <th className="py-3.5 px-4 md:px-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAD8CC]/60 text-[#3D2B1F]">
                {filteredProducts.map((p) => (
                  <tr key={p._id} className="hover:bg-[#FAF7F2]/60 transition-colors group">
                    {/* Product Name & Thumbnail */}
                    <td className="py-3.5 px-4 md:px-6">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#FAF7F2] border border-[#EAD8CC] shrink-0 group-hover:scale-105 transition-transform">
                          <ImageWithFallback
                            src={p.images?.[0]}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-[#3D2B1F] group-hover:text-[#964824] transition-colors line-clamp-1">
                            {p.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#964824]/10 text-[#964824] border border-[#964824]/20">
                              {p.category}
                            </span>
                            <span className="text-[11px] text-[#7A6255] font-mono">ID: {p._id.slice(-6)}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-4">
                      <span className="font-serif font-bold text-sm md:text-base text-[#964824]">
                        {formatCurrencyShort(p.price)}
                      </span>
                    </td>

                    {/* Stock */}
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-xs text-[#3D2B1F]">{p.stock} cái</span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                          p.stock > 0
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            p.stock > 0 ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        />
                        {p.stock > 0 ? 'Còn hàng' : 'Hết hàng'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 md:px-6 text-right">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        <Link
                          to={`/products/${p._id}`}
                          target="_blank"
                          className="p-1.5 rounded-lg text-[#7A6255] hover:text-[#964824] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                          title="Xem trên trang công khai"
                        >
                          <ExternalLink size={15} />
                        </Link>
                        <Link
                          to={`/host/products/${p._id}/edit`}
                          className="p-1.5 rounded-lg text-[#964824] hover:bg-[#964824]/10 transition-colors"
                          title="Chỉnh sửa sản phẩm"
                        >
                          <Edit size={15} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleOpenDelete(p)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Xóa sản phẩm"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Confirm Delete */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => !deleteLoading && setIsDeleteModalOpen(false)}
        title="Xác nhận xóa sản phẩm"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-3">
            <AlertTriangle size={18} className="text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Hành động này không thể hoàn tác</p>
              <p className="mt-1">
                Bạn có chắc chắn muốn xóa sản phẩm "
                <strong className="text-rose-950">{targetProduct?.name}</strong>"? Tác phẩm này sẽ không còn
                xuất hiện trong cửa hàng xưởng nữa.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={deleteLoading}
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Hủy bỏ
            </Button>
            <Button
              type="button"
              variant="danger"
              isLoading={deleteLoading}
              onClick={handleExecuteDelete}
            >
              Xóa vĩnh viễn
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ManageProductsPage;
