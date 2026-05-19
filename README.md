# Trendyol Entegrasyon

Trendyol Marketplace API icin baslangic entegrasyon projesi.

## Neler var?

- Trendyol Basic Auth baglantisi
- Zorunlu `User-Agent` header'i
- Prod ve stage ortam secimi
- Urun listeleme
- Siparis listeleme
- Marka listeleme
- Stok/fiyat guncelleme icin temel endpoint

## Kurulum

```bash
cp .env.example .env
```

`.env` dosyasindaki bilgileri Trendyol Satici Paneli > Hesap Bilgilerim > Entegrasyon Bilgileri alanindan doldurun:

```env
TRENDYOL_SUPPLIER_ID=123456
TRENDYOL_API_KEY=your_api_key
TRENDYOL_API_SECRET=your_api_secret
TRENDYOL_ENV=prod
TRENDYOL_USER_AGENT_SUFFIX=SelfIntegration
PORT=3000
```

Calistirma:

```bash
npm start
```

Kontrol:

```bash
curl http://localhost:3000/health
```

## Endpointler

### Saglik kontrolu

```http
GET /health
```

### Urunleri listele

```http
GET /products?approved=true&size=50&page=0
```

### Siparisleri listele

```http
GET /orders?status=Created&orderByField=PackageLastModifiedDate&orderByDirection=DESC&size=50
```

Trendyol dokumanina gore tarih araligi kullanilirsa `startDate` ve `endDate` timestamp olarak gonderilir.

### Markalari listele

```http
GET /brands?name=adidas
```

### Stok ve fiyat guncelle

```http
POST /price-and-inventory
Content-Type: application/json

{
  "items": [
    {
      "barcode": "8680000000000",
      "quantity": 10,
      "salePrice": 199.99,
      "listPrice": 249.99
    }
  ]
}
```

## Guvenlik

`.env` dosyasi GitHub'a gonderilmez. API Key ve API Secret bilgilerini repoya yazmayin.

## Notlar

- Trendyol prod endpoint: `https://apigw.trendyol.com`
- Trendyol stage endpoint: `https://stageapigw.trendyol.com`
- Stage ortaminda IP yetkilendirmesi gerekebilir.
- Trendyol, API isteklerinde Auth ve User-Agent header'larini zorunlu tutar.
