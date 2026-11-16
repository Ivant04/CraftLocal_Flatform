import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-3xl border border-[#EAD8CC] p-8 text-center shadow-[0_8px_30px_rgba(61,43,31,0.06)]">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} />
            </div>

            <h2 className="font-serif text-xl font-bold text-[#3D2B1F] mb-2">
              {this.props.fallbackTitle || 'Đã có lỗi xảy ra khi hiển thị'}
            </h2>

            <p className="text-xs md:text-sm text-[#7A6255] mb-6 leading-relaxed">
              {this.props.fallbackMessage ||
                'Trang này gặp sự cố không mong muốn trong quá trình kết xuất dữ liệu. Vui lòng thử tải lại trang.'}
            </p>

            {this.state.error?.message && (
              <div className="mb-6 p-3 bg-[#FAF7F2] rounded-xl border border-[#EAD8CC] text-left">
                <p className="text-[11px] font-mono text-[#7A6255] break-words line-clamp-3">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#964824] hover:bg-[#7d3a1c] transition-colors shadow-xs cursor-pointer"
              >
                <RefreshCw size={14} />
                <span>Tải lại trang</span>
              </button>
              <a
                href="/"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-[#7A6255] bg-white border border-[#EAD8CC] hover:bg-[#FAF7F2] hover:text-[#964824] transition-colors cursor-pointer"
              >
                <Home size={14} />
                <span>Về trang chủ</span>
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
