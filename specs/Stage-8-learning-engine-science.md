# Stage 8 — Bilimsel Öğrenme Motoru: Spaced Repetition + Retrieval

## Amaç
Kullanıcının öğrendiği bilgileri unutmasını engellemek ve "Review" (Tekrar) sürecini bilimsel temellere oturtmak.

## 1. Algoritma (MVP & Iterasyon)
- **MVP (Leitner System Inspired):**
    - Kutular (Levels): 1 (Everyday), 2 (Every 3 days), 3 (Weekly), 4 (Monthly), 5 (Quarterly).
    - Doğru bilince Level artar (+1).
    - Yanlış bilince Level düşer (1'e döner).
    - `nextReviewDate = today + interval(level)`

- **Iterasyon (FSRS - Free Spaced Repetition Scheduler):**
    - Parametreler: `Stability` (S), `Difficulty` (D), `Retrievability` (R).
    - Daha karmaşık ama daha hassas (Anki/SuperMemo benzeri).

## 2. Veri Modeli Eklentileri
```prisma
model Flashcard {
  id            String   @id
  question      String
  answer        String
  hint          String?
  
  // SRS Data
  interval      Int      @default(0) // Gün cinsinden
  easeFactor    Float    @default(2.5) // SM-2 algoritması için
  repetitions   Int      @default(0)
  nextReview    DateTime @default(now())
  
  lessonId      String?
  userId        String
}

model ReviewLog {
  id            String   @id
  flashcardId   String
  rating        Int      // 1: Again, 2: Hard, 3: Good, 4: Easy
  reviewedAt    DateTime @default(now())
}
```

## 3. Review Planlayıcı Kuralları
- **Daily Limit:** Günde max 50 yeni kart, max 200 review kartı (Burnout önleme).
- **Öncelik:** `Overdue` (Günü geçmiş) > `Today` > `New`.
- **Interleaving:** Aynı konunun kartlarını art arda sorma; konuları karıştır (A-B-A-B > A-A-B-B).

## 4. UI/UX: Review Ekranı
- **Front Face:** Soru görünür. Cevap gizli.
- **User Action:** "Show Answer" tıklar.
- **Back Face:** Cevap görünür.
- **Rating Buttons:** 
    - [Again (<1m)]
    - [Hard (2d)]
    - [Good (10m)]
    - [Easy (4d)] 
    (Süreler algoritmaya göre değişir).

## 5. Öğrenme Analitiği
- **Heatmap:** GitHub contribution graph benzeri "Study Activity".
- **Retention Rate:** Doğru hatırlama oranı grafiği.
- **Forecast:** Gelecek 7 günün tahmini tekrar yükü.

## 6. Anti-Bloat ve Temizlik
- **Leech Cards:** Eğer bir kart 10 kez üst üste "Again" (Yanlış) işaretlenirse, bu kart "Leech" (Sülük) olarak etiketlenir ve desteden çıkarılır. Kullanıcıya "Bunu yeniden yaz veya parçala" uyarısı verilir.

## VARSAYIMLAR
- Kullanıcılar her gün sisteme girip review yapmayabilir. Algoritma gecikmeleri tolere etmeli.

## DOĞRULAMA YOLU
- **Simülasyon:** 100 kartlık bir deste ile 30 günlük simülasyon çalıştır. Yük dağılımı (Review Load) mantıklı mı?
- **Retention Testi:** Kullanıcılar 1 hafta sonra bilgileri %80+ hatırlıyor mu?
