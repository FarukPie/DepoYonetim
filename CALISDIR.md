# Projeyi Çalıştırma Rehberi

Bu proje iki ana parçadan oluşmaktadır:
1. **Backend (Sunucu):** .NET Web API
2. **Frontend (Arayüz):** React + Vite

Projeyi çalıştırmak için her iki parçayı da ayağa kaldırmanız gerekir.

## 1. Otomatik Başlatma (Önerilen)

Ana dizinde bulunan **`baslat.bat`** dosyasına çift tıklayarak her iki tarafı da otomatik olarak başlatabilirsiniz.

---

## 2. Manuel Başlatma

Eğer manuel olarak çalıştırmak isterseniz, iki ayrı terminal açıp aşağıdaki adımları izleyin.

### Adım 1: Backend'i Çalıştır
Bir terminal açın ve şu komutları girin:

```bash
cd src/WebAPI
dotnet run
```

Backend `http://localhost:5038` (veya benzeri bir port) üzerinde çalışmaya başlayacaktır.

### Adım 2: Frontend'i Çalıştır
Yeni bir terminal daha açın ve şu komutları girin:

```bash
cd frontend
npm run dev
```

Frontend genellikle `http://localhost:5173` adresinde açılacaktır. Tarayıcınızda bu adrese giderek uygulamayı kullanabilirsiniz.
