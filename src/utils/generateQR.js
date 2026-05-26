import QRCode from 'qrcode';

const generateQRCode = async (data) => {
  try {
    const qrCode = await QRCode.toDataURL(data);
    return { success: true, qrCode };
  } catch (error) {
    console.error('QR generation error:', error);
    return { success: false, error: error.message };
  }
};

const generateQRCodeBuffer = async (data) => {
  try {
    const qrCode = await QRCode.toBuffer(data);
    return { success: true, qrCode };
  } catch (error) {
    console.error('QR generation error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  generateQRCode,
  generateQRCodeBuffer,
};
