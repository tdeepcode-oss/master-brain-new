# Stage 0 — Ürün Vizyonu + Prensipler (North Star)

## Amaç
Uygulamanın ruhunu, kime hitap ettiğini ve hangi felsefeyle inşa edildiğini netleştirmek.

## MVP Kapsamı
- **Core Loop:** Capture (Hızlı Ekle) -> Organize (Proje/Alan) -> Distill (Not/Özet) -> Express (Ürün/Bilgi).
- **Target Audience:** Life-long learners, Software Engineers, Content Creators.

## 1. Değer Önerisi (One-Liner)
"Darmadağın fikirleri, notları ve projeleri; bilimsel öğrenme metodlarıyla çalışan, eyleme dönüştürülebilir bir 'Yaşam İşletim Sistemi'ne (LifeOS) dönüştür."

## 2. Kullanıcı Profilleri
1.  **The Senior Developer:** Sürekli yeni teknolojiler öğreniyor, side-project yapıyor. Dağınık bookmarklardan ve yarım kalan projelerden bıkmış.
2.  **The Content Creator:** Youtuber/Blogger. Araştırma -> Senaryo -> Yayınlama pipeline'ına ihtiyacı var.
3.  **The Academic/Student:** Ciddi literatür taraması yapıyor, spaced repetition ile kalıcı öğrenmek istiyor.

## 3. Ürün Prensipleri (10 Madde)
1.  **Frictionless Capture:** Akla geleni sisteme atmak < 10 saniye olmalı.
2.  **Single Source of Truth:** Bir bilgi (görev, not) sadece bir yerde yaşar, her yerden referans verilir.
3.  **Link-First:** Klasörler hiyerarşiktir ve kırılgandır; linkler organiktir. Bağlantı kurmak, dosyalamaktan önemlidir.
4.  **Local-First Feel:** Web app olsa bile tepkiler (click, drag, type) anlık (optimistic UI) olmalı.
5.  **Offline-Capable:** İnternet yoksa bile sistem "Read-Only" değil, "Append-Only" çalışabilmeli (MVP'de sınırlı).
6.  **Progress over Perfection:** Tamamlanmayan işler suçluluk yaratmamalı (Anti-guilt UI).
7.  **Data Ownership:** Veri kullanıcınındır (Export her zaman açık).
8.  **Context-Aware:** "Sabah modu", "Deep Work modu" gibi bağlamlar görünümü değiştirmeli.
9.  **Keyboard Centric:** Fareye dokunmadan %90 navigasyon.
10. **Living System:** Çürüyen veri (eski tagler, ölü linkler) kullanıcıya raporlanmalı.

## 4. MVP Dışı Roadmap (10 Madde)
1.  Native Mobile App (React Native/Expo).
2.  AI "Chat with Brain" (RAG).
3.  Multi-player collaboration (Team spaces).
4.  Public Garden (Seçili notları publish etme).
5.  Visual Canvas (Excalidraw/Miro benzeri sonsuz tahta).
6.  OCR & Audio Transcription (Note taking automations).
7.  Email-to-Inbox integration.
8.  Zapier/Make API.
9.  Focus Timer (Pomodoro integration).
10. Hardware integrations (Kindle highlights, Apple Health).

## 5. Başarı Metrikleri
- **Daily Active User (DAU):** Günlük giriş.
- **Capture Rate:** Inbox'a atılan item sayısı / Gün.
- **Conversion Rate:** Inbox item -> Project/Note dönüşüm oranı (Process başarısı).
- **Learning Streak:** Aralıksız review yapılan gün sayısı.

## 6. Riskler ve Mitigasyonlar
1.  **Feature Creep:** (Risk: Sistem çok karmaşıklaşır) -> (Mitigasyon: Katı MVP sınırları, "Plugin" mimarisi düşüncesi).
2.  **Learning Curve:** (Risk: Kullanıcı sistemi anlamaz) -> (Mitigasyon: Onboarding wizard, örnek data ile başlatma).
3.  **Data Loss:** (Risk: Güven kaybı) -> (Mitigasyon: Günlük otomatik snapshot, JSON export).
4.  **Performance:** (Risk: Binlerce notta yavaşlama) -> (Mitigasyon: Virtual list, pagination, optimistic updates).
5.  **Vendor Lock-in:** (Risk: Kullanıcı gitmek isterse) -> (Mitigasyon: Full Markdown export).
6.  **Sync Conflicts:** (Risk: Aynı nota iki cihazdan yazma) -> (Mitigasyon: Last-write-wins (MVP), CRDT (v3)).
7.  **Over-Engineering:** (Risk: Dev süresi uzar) -> (Mitigasyon: Shadcn/ui, Supabase gibi hazır tuğlalar).
8.  **Maintenance Burden:** (Risk: Tek kişilik dev kadrosu) -> (Mitigasyon: Clean code, Typescript strict mode).

## 7. Yaşayan Sistem Prensipleri
- **Weekly Review:** Her Pazar kullanıcıya "Haftayı Gözden Geçir" sihirbazı çıkar.
- **Tag Gardening:** Ayda bir "Kullanılmayan Tag'ler" raporu.
- **Someday/Maybe Cleaning:** 6 aydır dokunulmayanları Arşiv'e itme.

## VARSAYIMLAR
- Kullanıcıların %80'i masaüstünde organize eder, mobilde tüketir/ekler.
- Kullanıcılar Markdown syntax'ına aşinadır veya öğrenmeye açıktır.

## DOĞRULAMA YOLU
- **Landing Page Test:** Value proposition A/B testi.
- **User Interview:** 5 hedef kullanıcı ile "Mevcut sisteminizde en büyük acı ne?" mülakatı.
