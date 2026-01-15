# Stage 2 — Bilgi Mimarisi (IA) + Navigasyon + Sayfa Haritası

## Amaç
Kullanıcının sistem içinde kaybolmadan, aradığına < 2 tıkla ulaşmasını sağlamak.

## 1. Sidebar Navigasyon
Sidebar "Collapsible" olmalı (Mobilde Sheet/Drawer).

- **Quick Action:** `[+] New Task`, `Search (Cmd+K)`
- **Core (Sabit):**
    - `Inbox` (Gelen kutusu)
    - `Today` (My Day)
    - `Next Actions` (GTD Next)
- **Structure (PARA):**
    - `Projects` (Aktif Projeler)
    - `Areas` (Sorumluluk Alanları)
    - `Resources` (Kaynaklar/Linkler)
    - `Archives` (Saklananlar)
- **Knowledge:**
    - `Library` (Tüm Notlar)
    - `Education` (Kurslar/Dersler)
    - `Brain Gym` (Review/Spaced Repetition)
- **Bottom:**
    - `Settings`
    - `User Profile`

## 2. Ana Dashboard (Home)
Kullanıcı giriş yaptığında (veya `/dashboard`) göreceği "Kokpit".

- **Greeting:** "Good Morning, User. Energy Level: High?"
- **Metrics (Özet):**
    - "3 Tasks Due Today"
    - "2 Reviews Pending"
    - "Current Project: X"
- **My Day (Widget):** Bugünün görev listesi (Hızlı check).
- **Quick Capture (Widget):** Hızlıca `Not` veya `Task` yazıp `Enter`a basmalık input.
- **Recent Notes:** Son düzenlenen 5 not.

## 3. Sayfa Haritası ve Bileşenler
- **`/inbox`**:
    - Amaç: Triage (Sınıflandırma).
    - Bileşenler: Liste, Swipe actions (Mobil), Quick Edit (Project/Date atama).
- **`/projects`**:
    - Amaç: Proje yönetimi.
    - Görünüm: Grid (Kartlar) veya Table.
- **`/projects/[id]`**:
    - Amaç: Proje detayı.
    - Tablar: Overview, Tasks (Kanban), Notes, Resources.
- **`/library` (Notes)**:
    - Amaç: Not arşivi.
    - Filtreler: Tag cloud, Klasörler (opsiyonel), Favorites.
- **`/education/[courseId]`**:
    - Amaç: Ders çalışma.
    - Sidebar: Ders programı (Modules/Lessons).
    - Main: Video Player + Note Editor (yanyana).

## 4. User Flows
**(a) Quick Capture -> Inbox -> Organize**
1. Kullanıcı `Cmd+K` basar -> "Add Task" seçer.
2. "Buy Milk" yazar -> `Enter`.
3. Task `Inbox`'a düşer.
4. Kullanıcı müsait zamanda Inbox'a girer.
5. Task'a tıklar -> Project: "House", Due: "Today" seçer.
6. Task `Inbox`'tan çıkar, `Today` görünümüne gider.

**(b) Lesson İzleme**
1. `/education` -> "Next.js Course" seçer.
2. "Middleware" dersini açar.
3. Videoyu izlerken sağdaki panele not alır (Timestamp'li not).
4. Bir kavramı anlamadı -> "Create Flashcard" butonuna basar -> Ön/Arka yüzü yazar -> Kaydeder.
5. Dersi bitirir -> "Mark Complete". (Review kuyruğuna otomatik eklenir).

## 5. Erişilebilirlik ve Kısayollar
- **Accessibility:** Renk kontrastı (WCAG AA), Focus yönetimi (Tab ile gezinti), ARIA labels.
- **Kısayollar:**
    - `Cmd+K`: Global Search / Command Menu.
    - `Cmd+Enter`: Save & Close (Dialoglarda).
    - `N`: New Note.
    - `T`: New Task.
    - `/`: Editor içinde Slash Menu.

## 6. View Sistemi
Kullanıcılar veriyi farklı görmek ister.
- **List View:** Yoğun bilgi, toplu işlem.
- **Board View (Kanban):** Durum takibi (To do, Doing, Done).
- **Calendar View:** Zamana dayalı görevler.
- **Gallery View:** Görsel ağırlıklı (Kitap/Resource kapağı).

## VARSAYIMLAR
- Kullanıcıların çoğu "Task" ve "Note" ayrımını kesin çizgilerle yapar (Ama bazen bir Task Nota dönüşebilir).
- Projeler hem not hem task içerebilir.

## DOĞRULAMA YOLU
- **Tree Testing:** Navigasyon menüsünü kullanıcılara verip "Arşivlenmiş projeyi bul" görevi vermek.
