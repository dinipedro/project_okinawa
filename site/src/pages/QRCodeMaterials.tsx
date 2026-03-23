import QRCodePreview from '@/components/marketing/QRCodePreview';
import SEOHead from "@/components/seo/SEOHead";

const QRCodeMaterials = () => {
  return (
    <>
      <SEOHead
        title="Materiais QR Code"
        description="Gere e baixe materiais de QR Code personalizados para seu restaurante. Integre o Okinawa às mesas do seu estabelecimento."
        canonical="/marketing/qr-codes"
        noIndex
      />
      <QRCodePreview />
    </>
  );
};

export default QRCodeMaterials;
