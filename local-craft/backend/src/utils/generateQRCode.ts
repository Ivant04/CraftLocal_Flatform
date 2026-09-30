import QRCode from 'qrcode';

export const generateQRCode = async (data: string): Promise<string> => {
  try {
    const qrDataUrl = await QRCode.toDataURL(data, {
      width: 300,
      margin: 2,
      color: { dark: '#3D2B1F', light: '#FFFFFF' },
    });
    return qrDataUrl;
  } catch (error) {
    throw new Error('Không thể tạo mã QR');
  }
};
