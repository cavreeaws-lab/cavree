# Cavree Admin Panel - UI/Feature Audit & Gap Analysis

> Generated from screenshots in `/cavree admin pannel/` folder vs current codebase.

---

## 1. ADMIN PANEL (FRANCHISEE ROLE) - Target vs Current

### 1.1 Layout Structure

| Element | Target Design | Current Status | Gap |
|---------|--------------|----------------|-----|
| Sidebar | Dark themed, icons + labels, collapsible sections | Basic dark sidebar with icons | Missing collapsible sections |
| Top Header | Page title left, search bar, notifications bell, profile dropdown | Page title + "Franchise Admin" text | Missing: search, notifications, profile menu, breadcrumbs |
| Breadcrumbs | Present above content | Missing | Needs breadcrumb navigation |
| Stats Cards | 4 cards in row with icons, values, change indicators | Dashboard has basic stats | Needs redesign with icons and change % |
| Charts | Line chart (Sales), Bar chart (Products), Pie chart (Orders) | No charts in current dashboard | Missing chart library integration |
| Recent Activity | Activity feed widget | Missing | Add activity log widget |
| Footer | Light footer with version info | Missing | Add minimal footer |

### 1.2 Navigation Menu (Sidebar)

**Target Menu Items (in order):**
1. Dashboard
2. Orders (with submenu: All Orders, Pending, Processing, Shipped, Delivered, Cancelled)
3. Products (with submenu: All Products, Add Product, Categories, Inventory, Reviews)
4. Customers
5. Coupons
6. Content (Banners, Pages)
7. Reports (Sales, Products, Customers)
8. Wallet / Commission
9. Settings (Store, Profile, Notifications)

**Current Menu Items:**
Dashboard, Orders, Products, Customers, Categories, Inventory, Coupons, Content, Reviews, Reports, Wallet, Settings

**Gaps:**
- Missing collapsible submenus for Orders and Products
- Missing notification badge on Orders

---

### 1.3 Dashboard Page (`/admin/dashboard`)

**Target Features:**
- **Stats Row:** 4 cards
  - Total Orders (icon: ShoppingCart, change % up/down)
  - Total Revenue (icon: DollarSign, change %)
  - Total Products (icon: Package, change %)
  - Total Customers (icon: Users, change %)
- **Sales Chart:** Line chart showing sales over time (7 days, 30 days, 6 months, 1 year filters)
- **Top Products:** Table/card list of best-selling products
- **Recent Orders:** Table with latest 5-10 orders (Order #, Customer, Amount, Status)
- **Quick Actions:** Buttons for Add Product, View Orders, Add Coupon

**Current Status:** Basic stats cards without icons or change indicators. No charts.

**Missing:** Charts, top products, quick actions, proper stat card design.

---

### 1.4 Orders Module (`/admin/orders`)

**Target Features:**
- **Search Bar:** Full-text search by order ID, customer name, email
- **Filter Bar:** Date range picker, Status dropdown, Payment method dropdown
- **Bulk Actions:** Select all checkbox, bulk status update, bulk delete
- **Table Columns:** Checkbox, Order ID, Customer (name + email), Date, Items Count, Total, Payment Status, Order Status, Actions (View, Edit, Invoice)
- **Pagination:** Page numbers + items per page selector
- **Export:** CSV/Excel export button
- **Order Detail Page (`/admin/orders/[id]`):**
  - Order info card (Order #, Date, Payment Method, Status timeline)
  - Customer info card
  - Shipping Address card with map
  - Order Items table with images
  - Payment details
  - Status update dropdown + notes
  - Print Invoice button
  - Cancel/Refund buttons

**Current Status:**
- Basic table with Order ID, Customer, Date, Status (editable dropdown), Payment, Total
- No search, no filters, no bulk actions, no export
- Order detail exists but simplified - no timeline, no invoice, no map

**Missing:**
- Search & filters
- Bulk actions
- Export functionality
- Order status timeline/visual tracker
- Invoice generation/print
- Map in shipping address
- Better order detail layout

---

### 1.5 Products Module (`/admin/products`)

**Target Features:**
- **Search Bar:** By name, SKU
- **Filters:** Category dropdown, Status toggle, Stock status
- **View Toggle:** Grid view / List view
- **Table Columns:** Image thumbnail, Name, SKU, Category, Price, Stock, Status, Featured, Actions (Edit, Duplicate, Delete)
- **Add Product (`/admin/products/new`):**
  - Multi-step or tabbed form:
    - **General:** Name, Slug, Description (rich text editor), Category, Brand, Tags
    - **Pricing:** Price, Compare at Price, Cost per item, Tax settings
    - **Inventory:** SKU, Barcode, Stock quantity, Track quantity, Allow backorders, Low stock alert threshold
    - **Variants:** Size, Color, Material variants with individual SKUs, prices, quantities
    - **Images:** Multi-image upload with drag-drop, thumbnail crop, alt text
    - **SEO:** Meta title, Meta description, URL handle
    - **Shipping:** Weight, Dimensions, Shipping class
- **Edit Product (`/admin/products/[id]/edit`):** Same as add with data pre-filled
- **Product Detail View:** Full product preview

**Current Status:**
- Basic product list table
- Add/Edit product forms exist but simplified
- Missing: rich text editor, brand, tags, barcode, backorders, low stock alert, shipping dimensions, SEO fields
- Image upload basic, no drag-drop or crop
- Variants exist but simpler

**Missing:**
- Grid/list view toggle
- Rich text editor for description
- Brand, Tags fields
- Barcode, Cost per item
- Low stock alerts
- Backorder settings
- SEO tab (meta title, description)
- Shipping weight/dimensions
- Image drag-drop upload
- Product duplicate action

---

### 1.6 Categories (`/admin/categories`)

**Target Features:**
- Tree/hierarchical view of categories
- Drag-drop reordering
- Add/Edit: Name, Slug, Parent category, Description, Image, SEO fields
- Subcategory support

**Current Status:** Basic flat list with add/edit.

**Missing:**
- Tree view
- Drag-drop reorder
- Parent category selector
- Category image
- SEO fields for category

---

### 1.7 Inventory (`/admin/inventory`)

**Target Features:**
- Stock overview table: Product, SKU, Current Stock, Reserved, Available, Low Stock Alert
- Adjust stock modal: Add/Remove quantity with reason
- Stock history log: Date, Quantity Change, Reason, User
- Low stock warnings (badge/color coding)
- Export stock report

**Current Status:** Basic page exists but may be minimal.

**Missing:**
- Reserved vs Available stock tracking
- Stock adjustment with reason
- Stock history/audit log
- Low stock color coding
- Export

---

### 1.8 Customers (`/admin/customers`)

**Target Features:**
- Search by name, email, phone
- Filter by: Registration date, Total orders, Total spent
- Table: Name, Email, Phone, Registration Date, Total Orders, Total Spent, Status
- Customer Detail (`/admin/customers/[id]`):
  - Profile info
  - Order history
  - Address book
  - Activity log
  - Notes/Tags

**Current Status:** Basic customer list from orders.

**Missing:**
- Dedicated customer detail page
- Customer registration date tracking
- Total spent calculation
- Customer status (active/inactive)
- Customer notes/tags
- Activity log

---

### 1.9 Coupons (`/admin/coupons`)

**Target Features:**
- Search by code
- Filter by: Type, Status, Date range
- Table: Code, Type (Percentage/Fixed), Value, Min Order, Usage/Limit, Status, Expiry, Actions
- Add/Edit Coupon:
  - Code (auto-generate option)
  - Type: Percentage / Fixed Amount / Free Shipping / Buy X Get Y
  - Value
  - Min Order Amount
  - Max Discount (for %)
  - Usage Limit (total and per customer)
  - Applicable Products/Categories (include/exclude)
  - Customer Eligibility (all/specific segments)
  - Start/End Date with time
  - Status toggle

**Current Status:** Basic coupon CRUD exists.

**Missing:**
- Free Shipping / Buy X Get Y types
- Applicable products/categories selector
- Customer eligibility rules
- Per-customer usage limit
- Auto-generate code button
- Coupon usage statistics

---

### 1.10 Reviews (`/admin/reviews`)

**Target Features:**
- Filter by: Status (Pending/Approved/Rejected), Rating, Product
- Table: Product, Customer, Rating, Review Text, Date, Status, Actions (Approve/Reject/Reply/Delete)
- Bulk approve/reject
- Reply to review
- Review detail modal

**Current Status:** Basic review list.

**Missing:**
- Pending/Approved/Rejected status workflow
- Reply functionality
- Bulk actions
- Review detail modal

---

### 1.11 Content / Banners (`/admin/content`)

**Target Features:**
- Banner Management:
  - Add/Edit: Title, Image, Link URL, Position (Home Top, Home Middle, Category Page), Order, Status
  - Preview banner
- Page Management (CMS pages):
  - Add/Edit: Title, Slug, Content (rich text), Meta tags, Status
- FAQ Management
- Policy Pages (Terms, Privacy, Shipping, Return)

**Current Status:** Basic content settings.

**Missing:**
- Banner position management
- Banner ordering
- Banner preview
- CMS page editor
- FAQ management
- Policy page templates

---

### 1.12 Reports (`/admin/reports`)

**Target Features:**
- **Sales Report:**
  - Date range picker
  - Summary cards: Total Sales, Orders, Average Order Value, Refunds
  - Sales trend chart
  - Sales by product table
  - Export to CSV/PDF
- **Product Report:**
  - Top selling products
  - Low stock products
  - Product views (if tracked)
- **Customer Report:**
  - New vs returning customers
  - Top customers by spend
  - Customer acquisition chart

**Current Status:** Basic reports with some stats.

**Missing:**
- Date range filters on all reports
- Charts for each report type
- Export functionality
- Product views tracking
- Customer acquisition metrics
- PDF export

---

### 1.13 Wallet / Commission (`/admin/wallet`)

**Target Features:**
- **Commission Dashboard:**
  - Total Earnings card
  - Pending Commission card
  - Paid Commission card
  - Commission rate display
- **Earnings Table:**
  - Date, Order #, Order Total, Commission %, Commission Amount, Status (Pending/Paid)
- **Payout History:**
  - Date, Amount, Method, Status, Transaction ID
- **Payout Request Button:**
  - Request payout modal (Amount, Method, Account details)
- **Commission Settings:** (Super Admin controlled)

**Current Status:** Basic wallet page exists.

**Missing:**
- Detailed earnings breakdown per order
- Payout request flow
- Payout history
- Commission status tracking (Pending/Paid)
- Withdrawal methods (Bank, UPI)

---

### 1.14 Settings (`/admin/settings`)

**Target Features:**
- **Store Settings:**
  - Store Name, Logo, Favicon upload
  - Contact Email, Phone, Address
  - Currency, Timezone, Language
- **Profile Settings:**
  - Name, Email, Phone, Avatar upload
  - Change Password
- **Notification Settings:**
  - Email notifications toggle (New Order, Order Cancelled, Low Stock, New Review)
  - Push notifications toggle
- **Shipping Settings:**
  - Free shipping threshold
  - Standard shipping cost
  - Shipping zones/regions
- **Payment Settings:**
  - Razorpay keys (test/live toggle)
  - COD toggle
- **Tax Settings:**
  - Tax rate, Tax inclusive/exclusive

**Current Status:** Basic settings page.

**Missing:**
- Store logo/favicon upload
- Currency, timezone, language settings
- Avatar upload for profile
- Notification preferences
- Shipping zones
- Tax settings
- Payment method configuration UI

---

## 2. SUPER ADMIN PANEL - Target vs Current

### 2.1 Layout Structure

| Element | Target Design | Current Status | Gap |
|---------|--------------|----------------|-----|
| Sidebar | Same as Admin but with Super Admin branding | Dark sidebar with Super Admin label | Similar structure |
| Navigation | Dashboard, Applications, Franchises, Orders, Products, Users, Analytics, Content, Settings | Dashboard, Applications, Franchises, Orders, Products, Users, Analytics, Content, Settings | Matches well |

### 2.2 Dashboard (`/super-admin/dashboard`)

**Target Features:**
- System-wide stats:
  - Total Users
  - Total Franchisees
  - Total Orders (all franchises)
  - Total Revenue (all franchises)
  - Total Products
  - Pending Applications count (with badge)
- **Franchise Performance Chart:** Revenue by franchise
- **Recent Franchise Applications:** Quick action buttons
- **System Health:** Server status, recent errors

**Current Status:** Basic stats exist.

**Missing:**
- Franchise performance comparison chart
- Pending applications widget with actions
- System health monitor

---

### 2.3 Franchise Applications (`/super-admin/franchise-applications`) ✅ NEW

**Implemented:**
- List view with filters (ALL, PENDING, APPROVED, REJECTED)
- Approve action: Creates Franchisee user + Franchise
- Reject action: Updates status
- Notes field
- Temp password display on approve

**Missing from Target:**
- Search by name/email/city
- Export applications
- Bulk approve/reject
- Application detail modal with full info
- Email templates for approve/reject notifications

---

### 2.4 Franchises (`/super-admin/franchises`)

**Target Features:**
- Table: Name, City, Owner, Email, Commission %, Status, Total Orders, Total Revenue, Products, Actions
- Add Franchise: Form with all fields
- Edit Franchise: Modal or page
- View Franchise Detail:
  - Profile info
  - Owner details
  - Performance stats
  - Product count
  - Order history
  - Commission earned
- Deactivate/Activate toggle
- Delete franchise (with confirmation)

**Current Status:** Basic table with Name, City, Owner, Status, Products.

**Missing:**
- Commission % display
- Total Orders/Revenue per franchise
- Franchise detail page
- Edit modal
- Activate/Deactivate toggle
- Delete with confirmation
- Search and filters

---

### 2.5 All Orders (`/super-admin/orders`)

**Target Features:**
- Same as Admin Orders but with Franchise column
- Filter by franchise
- Cross-franchise analytics

**Current Status:** Basic table with Order #, Customer, Franchise, Total, Status.

**Missing:**
- Same as Admin Orders (search, filters, bulk actions, export)
- Franchise filter
- Order detail view

---

### 2.6 All Products (`/super-admin/products`)

**Target Features:**
- Same as Admin Products but with Franchise column
- Filter by franchise
- Cross-franchise product management
- Feature/Unfeature products globally

**Current Status:** Basic product list.

**Missing:**
- Same as Admin Products
- Franchise filter/assignment
- Global feature/unfeature

---

### 2.7 Users (`/super-admin/users`)

**Target Features:**
- Search by name, email, role
- Filter by: Role (Customer, Franchisee, Admin), Status, Registration Date
- Table: Name, Email, Role, Status, Registration Date, Last Login, Actions (Edit, Deactivate, Delete, Reset Password, Impersonate)
- Add User: Form with all fields + role assignment
- Edit User: Role change, status toggle
- User Detail: Profile, Orders, Activity log

**Current Status:** Basic user list.

**Missing:**
- Search and filters
- Status column (active/inactive)
- Last login tracking
- Reset password action
- Impersonate login
- User detail page
- Activity log

---

### 2.8 Analytics (`/super-admin/analytics`)

**Target Features:**
- **Sales Overview:**
  - Total Revenue line chart
  - Orders by status pie chart
  - Revenue by franchise bar chart
- **User Analytics:**
  - New registrations chart
  - User retention
  - Active users
- **Product Analytics:**
  - Top viewed products
  - Conversion rates
- **Franchise Performance:**
  - Revenue comparison
  - Order count comparison
  - Commission payouts
- Date range: Today, Yesterday, Last 7 days, Last 30 days, This month, Custom

**Current Status:** Basic analytics with some stats.

**Missing:**
- Charts (line, bar, pie)
- User retention metrics
- Product view tracking
- Conversion rates
- Franchise comparison charts
- Date range picker with presets

---

### 2.9 Content (`/super-admin/content`)

**Target Features:**
- Same as Admin Content but with system-wide scope
- Global banner management
- CMS pages for all subdomains
- Email template editor

**Current Status:** Basic content page.

**Missing:** Same as Admin Content + email templates.

---

### 2.10 Settings (`/super-admin/settings`)

**Target Features:**
- **System Settings:**
  - Site Name, Logo, Favicon
  - Domain configuration
  - Email SMTP settings
  - SMS gateway settings
- **Commission Settings:**
  - Default commission %
  - Per-franchise commission override
  - Payout thresholds
  - Payout schedule
- **Payment Gateway:**
  - Razorpay Live/Test keys
  - COD settings
  - Other payment methods
- **Shipping Settings:**
  - Global shipping rules
  - Shipping zones by pincode
- **Tax Settings:**
  - GST/Tax rates by state
  - Tax inclusive settings
- **Notification Templates:**
  - Order confirmation email template
  - Shipping notification template
  - Welcome email template
  - Password reset template
- **Security:**
  - Admin IP whitelist
  - Session timeout
  - 2FA toggle
- **Backup:**
  - Database backup button
  - Auto-backup schedule

**Current Status:** Basic settings.

**Missing:**
- SMTP/SMS configuration
- Commission settings UI
- Shipping zones by pincode
- GST state-wise rates
- Email template editor
- Security settings (IP whitelist, 2FA)
- Backup management

---

## 3. COMMON UI COMPONENTS NEEDED

### 3.1 Reusable Components to Build

| Component | Purpose | Status |
|-----------|---------|--------|
| `StatCard` | Dashboard stat with icon, value, change % | Basic version exists |
| `DataTable` | Sortable, filterable, paginated table | Needs enhancement |
| `SearchInput` | Debounced search with clear button | Missing |
| `DateRangePicker` | Date range selection | Missing |
| `FileUpload` | Drag-drop multi-file upload with preview | Missing |
| `ImageGallery` | Sortable image grid with delete | Missing |
| `RichTextEditor` | WYSIWYG content editor | Missing |
| `StatusBadge` | Color-coded status labels | Basic version exists |
| `ConfirmModal` | Reusable confirmation dialog | Missing |
| `Toast` | Notification toasts | react-hot-toast exists |
| `Breadcrumbs` | Page breadcrumb navigation | Missing |
| `Pagination` | Page numbers + per-page selector | Missing |
| `BulkActionsBar` | Sticky bar for bulk operations | Missing |
| `EmptyState` | Empty list illustration/message | Missing |
| `SkeletonLoader` | Loading skeletons | Basic pulse exists |
| `ChartCard` | Card wrapper for charts | Missing |
| `FilterBar` | Horizontal filter controls | Missing |
| `ExportButton` | CSV/PDF export dropdown | Missing |

### 3.2 Chart Library Needed

- **Recharts** is already installed — use for:
  - Line charts (Sales trend)
  - Bar charts (Revenue by franchise, Top products)
  - Pie charts (Orders by status, Customer segments)
  - Area charts (User growth)

---

## 4. API ENDPOINTS NEEDED

### 4.1 Missing Admin APIs

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/admin/orders/export` | POST | Export orders to CSV |
| `/api/admin/products/export` | POST | Export products to CSV |
| `/api/admin/products/duplicate` | POST | Duplicate a product |
| `/api/admin/inventory/adjust` | POST | Adjust stock with reason |
| `/api/admin/inventory/history` | GET | Stock adjustment history |
| `/api/admin/customers/[id]` | GET | Customer detail with orders |
| `/api/admin/customers/[id]/notes` | POST | Add customer note |
| `/api/admin/reviews/[id]/reply` | POST | Reply to review |
| `/api/admin/reviews/bulk` | PUT | Bulk approve/reject |
| `/api/admin/coupons/validate` | POST | Test coupon validity |
| `/api/admin/content/banners` | GET/POST | Banner CRUD |
| `/api/admin/content/pages` | GET/POST | CMS page CRUD |
| `/api/admin/reports/sales` | GET | Sales report with date range |
| `/api/admin/reports/products` | GET | Product performance |
| `/api/admin/reports/customers` | GET | Customer report |
| `/api/admin/settings/notifications` | GET/PUT | Notification preferences |
| `/api/admin/wallet/payout` | POST | Request payout |
| `/api/admin/wallet/payouts` | GET | Payout history |

### 4.2 Missing Super Admin APIs

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/super-admin/franchises/[id]/toggle` | PUT | Activate/deactivate |
| `/api/super-admin/franchises/[id]/commission` | PUT | Update commission |
| `/api/super-admin/users/[id]/reset-password` | POST | Reset user password |
| `/api/super-admin/users/[id]/impersonate` | POST | Generate impersonation token |
| `/api/super-admin/users/[id]/toggle` | PUT | Activate/deactivate user |
| `/api/super-admin/settings/commission` | GET/PUT | Commission defaults |
| `/api/super-admin/settings/email` | GET/PUT | SMTP settings |
| `/api/super-admin/settings/shipping` | GET/PUT | Shipping zones |
| `/api/super-admin/settings/tax` | GET/PUT | Tax rates |
| `/api/super-admin/settings/notifications` | GET/PUT | Email templates |
| `/api/super-admin/analytics/franchises` | GET | Franchise comparison |
| `/api/super-admin/analytics/users` | GET | User analytics |
| `/api/super-admin/backup` | POST | Trigger backup |

---

## 5. PRIORITY ROADMAP

### Phase 1: Critical Missing (Blocking functionality)
1. ✅ Franchise Application Approval flow (DONE)
2. Order detail page improvements (timeline, invoice)
3. Product form enhancements (rich text, SEO, variants)
4. Customer detail page
5. Search and filters on all list pages

### Phase 2: UX Improvements
6. Charts on Dashboard and Analytics
7. DataTable component with sorting, filtering, pagination
8. File upload with drag-drop
9. Breadcrumbs and better navigation
10. Empty states and loading skeletons

### Phase 3: Advanced Features
11. Bulk actions on tables
12. Export to CSV/PDF
13. Email template editor
14. Commission payout workflow
15. Shipping zones configuration
16. Tax/GST settings
17. Notification preferences
18. Backup system

---

## 6. FILE STRUCTURE NOTES

Current admin routes:
```
/src/app/admin/
  dashboard/page.tsx
  orders/page.tsx, [id]/page.tsx
  products/page.tsx, new/page.tsx, [id]/edit/page.tsx
  customers/page.tsx
  categories/page.tsx
  inventory/page.tsx
  coupons/page.tsx
  content/page.tsx
  reviews/page.tsx
  reports/page.tsx
  wallet/page.tsx
  settings/page.tsx
```

Current super-admin routes:
```
/src/app/super-admin/
  dashboard/page.tsx
  franchise-applications/page.tsx ✅ NEW
  franchises/page.tsx
  orders/page.tsx
  products/page.tsx
  users/page.tsx
  analytics/page.tsx
  content/page.tsx
  settings/page.tsx
```

---

## 7. DESIGN SYSTEM NOTES

From screenshots, the target design uses:
- **Color palette:** Teal/Cyan primary (#0d9488 or similar), dark sidebar (#1e293b or similar)
- **Typography:** Playfair Display for headings, Poppins for body
- **Border radius:** Medium (8px for cards, 6px for buttons)
- **Shadows:** Light shadows on cards
- **Spacing:** Generous padding (24px on cards)
- **Icons:** Lucide icons throughout
- **Form inputs:** Rounded with left icon, focus ring on primary color

Current implementation matches the general direction but needs:
- More consistent spacing
- Better card designs with shadows
- Icon integration in stats cards
- Proper empty states
- Loading skeletons instead of pulse divs

---

## 8. CUSTOMER-FACING WEBSITE - Target vs Current

> Analyzed from `/carvee website Final/` folder screenshots.

---

### 8.1 Design System (from screenshots)

| Token | Value | Status |
|-------|-------|--------|
| Primary Color | `#0E7B87` (Teal/Dark Cyan) | ✅ Matches `cavree-primary` |
| Secondary Color | `#35C6D6` (Light Cyan) | ✅ Matches `cavree-primary-light` |
| Accent Color | `#D4AF37` / Gold | Partially used in stars |
| Background | `#FFFFFF` (White) | ✅ |
| Dark Background | `#1A1A1C` (Footer) | ✅ Matches `cavree-dark` |
| Light Background | `#F5F5F5` / `#F8F8F8` | ✅ Matches `cavree-light` |
| Text Primary | `#1A1A1C` / `#333333` | ✅ |
| Text Muted | `#6B7280` / `#9CA3AF` | ✅ |
| Border | `#E5E7EB` | ✅ |
| Font Heading | Playfair Display | ✅ |
| Font Body | Montserrat / Poppins | ✅ |
| Border Radius (Cards) | 8px-12px | ✅ |
| Border Radius (Buttons) | 6px-8px | ✅ |
| Shadows | Light, subtle | Needs more consistent shadow |

**Missing Design Tokens:**
- No defined color for SALE/Discount badges (should be red `#EF4444`)
- No defined error state color consistently applied
- No skeleton/shimmer loading animation specs

---

### 8.2 Global Components

#### Header (Sticky)

**Target Design:**
- Top bar: Announcement banner ("FREE SHIPPING ON ORDERS ABOVE ₹5000 | COD AVAILABLE") — dark teal background, white text
- Main header: Logo left, navigation center, icons right
- Navigation: HOME, SHOP (with dropdown/megamenu for categories), FRANCHISE, ABOUT, CONTACT
- Icons: Search, Wishlist (heart), Cart (with count badge), Account
- Account dropdown: My Profile, My Orders, Wallet, Wishlist, Admin Panel (if applicable), Logout
- Mobile: Hamburger menu with full-screen overlay
- Search: Expandable search bar with autocomplete/suggestions

**Current Status (`src/components/layout/Header.tsx`):**
- ✅ Top announcement bar present
- ✅ Logo, nav, icons layout
- ✅ Search, wishlist, cart, account icons
- ✅ Cart count badge
- ✅ Account dropdown with conditional admin links
- ✅ Mobile hamburger menu
- ✅ Search opens inline

**Gaps:**
- Missing: Megamenu/dropdown for SHOP categories on hover
- Missing: Search autocomplete/suggestions
- Missing: Sticky header shadow on scroll
- Missing: Account dropdown shows My Profile, My Orders but missing Wallet, Wishlist links

---

#### Footer

**Target Design:**
- Newsletter section with email input + subscribe button
- 4-column links: Brand info + social, Shop, Company, Help
- Payment method icons (Visa, Mastercard, UPI, Razorpay)
- Copyright + legal links (Terms, Privacy, Cookies)
- Dark background (#1A1A1C)

**Current Status (`src/components/layout/Footer.tsx`):**
- ✅ Newsletter section
- ✅ 4-column layout
- ✅ Social icons (Instagram, Facebook, Twitter)
- ✅ Copyright bar
- ✅ Dark background

**Gaps:**
- Missing: Payment method icons/logos
- Missing: App download badges (if applicable)
- Missing: Live chat/help widget

---

### 8.3 Home Page (`/`)

**Target Screenshots Show:**

1. **Hero Slider:**
   - Full-width image slider with overlay gradient
   - Left-aligned text: Title, subtitle, CTA button
   - Dot indicators at bottom
   - Auto-slide with manual navigation

2. **Features Bar:**
   - Below hero: 4 features in a row with icons
   - Free Shipping, Secure Payment, 24/7 Support, Premium Quality
   - Light background with border-top

3. **Categories Section:**
   - "Shop by Category" heading
   - 4 category cards in grid (Women, Men, Accessories, Footwear)
   - Image background with dark overlay, centered text
   - Product count below category name
   - Hover: image zoom + overlay darken

4. **Featured Collection:**
   - "Featured Collection" heading + "View All" link
   - 4 product cards in grid
   - Card: Image (aspect 3:4), Category label, Product name, Price, Compare price (strikethrough), "Add to Cart" button
   - NEW and SALE badges on cards
   - Hover: image zoom

5. **New Arrivals:**
   - Same card design as Featured
   - "New Arrivals" heading + "View All" link

6. **Franchise CTA Banner:**
   - Full-width teal background section
   - "Become a Cavree Franchise" heading
   - Description text
   - "Apply Now" white button

7. **Testimonials/Reviews:** (seen in some screenshots)
   - Customer review cards
   - Star ratings, customer name, review text

8. **Instagram Feed:** (seen in some screenshots)
   - "Follow us on Instagram" section
   - Grid of Instagram images

**Current Status (`src/app/page.tsx`):**
- ✅ Hero slider with auto-advance
- ✅ Features bar with icons
- ✅ Categories section with image cards
- ✅ Featured Collection with product cards
- ✅ New Arrivals section
- ✅ Franchise CTA banner
- ❌ Missing: Testimonials/Reviews section
- ❌ Missing: Instagram feed section
- ❌ Missing: Newsletter popup/modal
- ❌ Missing: Limited time offer countdown banner

---

### 8.4 Shop Page (`/shop`)

**Target Design:**
- Breadcrumb: Home / Shop / Category (if filtered)
- Page title with product count
- **Sidebar Filters:**
  - Categories list with product counts
  - Price range slider (min-max) with input fields
  - Size filter (checkboxes)
  - Color filter (swatches)
  - Brand filter
  - Rating filter (stars)
  - Availability filter (In Stock)
  - "Clear All" button
- **Toolbar:**
  - Mobile: "Filters" button to open drawer
  - Sort dropdown: Newest, Price Low-High, Price High-Low, Name, Popularity, Rating
  - View toggle: Grid (3x3 icon) / List (LayoutList icon)
  - Items per page selector
- **Product Grid:**
  - 4 columns desktop, 3 tablet, 2 mobile
  - Card: Image, category, name, price, compare price, add to cart
  - Hover: quick view button, wishlist button appears
  - NEW/SALE badges
  - Pagination: Page numbers with prev/next
- **Product List View:**
  - Horizontal card: image left, info right
  - Description snippet
  - Add to cart button
  - Wishlist button
- **Empty State:** Illustration + "No products found" + Clear filters button

**Current Status (`src/app/shop/page.tsx`):**
- ✅ Breadcrumb
- ✅ Title with product count
- ✅ Sidebar: Categories, Price range inputs
- ✅ Mobile filter toggle
- ✅ Sort dropdown
- ✅ Grid/List view toggle
- ✅ Product grid with cards
- ✅ Loading skeleton
- ✅ Empty state (basic text only)
- ❌ Missing: Price range **slider** (only has input fields)
- ❌ Missing: Size, Color, Brand, Rating, Availability filters
- ❌ Missing: Hover quick view overlay
- ❌ Missing: Hover wishlist button on cards
- ❌ Missing: Pagination (page numbers)
- ❌ Missing: Items per page selector
- ❌ Missing: Empty state illustration

---

### 8.5 Product Detail Page (`/product/[slug]`)

**Target Design:**
- Breadcrumb: Home / Shop / Category / Product Name
- **Two-column layout:**
  - **Left - Images:**
    - Main large image (aspect 3:4)
    - Thumbnail strip below (clickable, active state border)
    - Zoom on hover (magnify effect)
    - Swipe on mobile
  - **Right - Info:**
    - Category name
    - Product name (large heading)
    - Star rating + review count
    - Price (large) + Compare price (strikethrough) + Discount % badge
    - Short description
    - SKU
    - **Size selector:** Button group (S, M, L, XL, XXL), out-of-stock sizes disabled
    - **Color selector:** Color swatches (circles with color fill)
    - **Quantity selector:** Minus/Plus buttons with number
    - **Stock status:** "In Stock" / "Out of Stock" / "Only X left"
    - **Actions:** "Add to Cart" (primary), "Buy Now" (secondary), "Add to Wishlist" (heart icon)
    - **Trust badges:** Free Shipping, Easy Returns, Secure Payment (icons)
    - **Share buttons:** WhatsApp, Facebook, Copy link
- **Product Tabs below:**
  - Description (rich text)
  - Reviews (list + write review form with star rating)
  - Shipping & Returns info
  - Size Guide
- **Related Products:**
  - "You May Also Like" heading
  - 4 product cards in slider/grid
- **Recently Viewed:** (if tracked)

**Current Status (`src/app/product/[slug]/page.tsx`):**
- ✅ Breadcrumb
- ✅ Main image + thumbnail strip
- ✅ Category, name, rating, review count
- ✅ Price + compare price
- ✅ Size selector
- ✅ Color selector (text buttons, not swatches)
- ✅ Quantity selector
- ✅ Add to Cart + Wishlist buttons
- ✅ Trust badges
- ✅ Tabs: Description, Reviews, Shipping
- ✅ Review form with star rating
- ✅ Review list
- ❌ Missing: Zoom on hover for main image
- ❌ Missing: Color swatches (circles) — currently text buttons
- ❌ Missing: Out-of-stock size disabling
- ❌ Missing: Stock quantity indicator ("Only X left")
- ❌ Missing: "Buy Now" button
- ❌ Missing: Share buttons
- ❌ Missing: Related Products section
- ❌ Missing: Recently Viewed section
- ❌ Missing: Size Guide tab
- ❌ Missing: Rich text formatting in description

---

### 8.6 Cart Page (`/cart`)

**Target Design:**
- Page title: "Shopping Cart"
- **Cart Items Table:**
  - Image thumbnail, Product name, Variant info (size/color), Unit price
  - Quantity adjuster (minus/number/plus)
  - Line total
  - Remove item (trash icon)
  - Move to Wishlist link
  - Cart total items count at top
- **Order Summary Card (sticky on desktop):**
  - Subtotal
  - Shipping cost (or "FREE" with threshold message)
  - Discount/Coupon input field + Apply button
  - Tax
  - Grand Total
  - "Proceed to Checkout" button
  - "Continue Shopping" link
  - Accepted payment icons
- **Empty Cart State:**
  - Illustration (shopping bag)
  - "Your cart is empty" text
  - "Start Shopping" CTA button

**Current Status (`src/app/cart/page.tsx`):**
- ✅ Page title
- ✅ Cart items with image, name, variant, price, quantity, line total
- ✅ Quantity adjuster
- ✅ Remove item (trash icon)
- ✅ Order Summary: Subtotal, Shipping, Total
- ✅ Free shipping threshold message
- ✅ Proceed to Checkout button
- ✅ Continue Shopping link
- ✅ Clear Cart button
- ✅ Empty cart state with icon and CTA
- ❌ Missing: Move to Wishlist per item
- ❌ Missing: Coupon/Discount code input
- ❌ Missing: Tax line
- ❌ Missing: Payment method icons
- ❌ Missing: Sticky order summary on desktop

---

### 8.7 Checkout Page (`/checkout`)

**Target Design:**
- Breadcrumb: Cart / Checkout
- **Stepper Progress:** Shipping → Payment → Review (3 steps with visual indicator)
- **Step 1 - Shipping:**
  - Saved addresses list with radio selection
  - "Add New Address" button (opens modal with form)
  - Address form: Name, Phone, Address Line 1, Address Line 2, City, State, Pincode, Country
  - "Deliver to this address" button
- **Step 2 - Payment:**
  - Razorpay (Card/UPI/NetBanking)
  - COD option
  - Payment method icons
  - "Continue" button
- **Step 3 - Review:**
  - Order items list with images
  - Selected address summary
  - Selected payment method
  - Price breakdown: Subtotal, Shipping, Tax, Discount, Total
  - "Place Order" button
- **Order Summary Sidebar:**
  - Items count, subtotal, shipping, total
  - Sticky on desktop
- **Order Success Page (`/checkout/success`):**
  - Thank you illustration
  - Order number
  - Order summary
  - Estimated delivery
  - "Continue Shopping" button
  - "Track Order" link

**Current Status (`src/app/checkout/page.tsx`):**
- ✅ Breadcrumb
- ✅ 3-step progress indicator
- ✅ Step 1: Shipping address selection
- ✅ Link to add new address
- ✅ Step 2: Payment method selection (Razorpay, COD)
- ✅ Step 3: Review order with items, address, totals
- ✅ Place Order with loading state
- ✅ Razorpay integration
- ✅ COD flow
- ✅ Order summary sidebar
- ❌ Missing: Add new address inline/modal (redirects to account page)
- ❌ Missing: Tax line in summary
- ❌ Missing: Order success page styling details
- ❌ Missing: Order tracking link on success
- ❌ Missing: Estimated delivery display

---

### 8.8 Account Pages

#### Account Layout (Sidebar)

**Target Design:**
- Sidebar: My Orders, Addresses, Wallet, Wishlist, Profile, Logout
- Icons next to each menu item
- Active item highlighted with primary color
- Mobile: Collapsible menu or bottom tabs

**Current Status:**
- ✅ Sidebar with menu items (seen in user's screenshot)
- ✅ Icons present
- ✅ Active state
- ❌ Missing: Bottom tabs for mobile

---

#### My Orders (`/account/orders`)

**Target Design:**
- Table/list of orders
- Columns: Order #, Date, Items, Total, Status, Actions
- Status badges with colors (Pending, Processing, Shipped, Delivered, Cancelled)
- "View Details" button per order
- Pagination
- Filter by status
- Search by order number

**Current Status:** Basic list exists.

**Gaps:**
- Missing: Search and filters
- Missing: Order status color badges
- Missing: Pagination
- Missing: Quick reorder action

---

#### Order Detail (`/account/orders/[id]`)

**Target Design:**
- Order number and date
- Status tracker (visual timeline): Ordered → Processing → Shipped → Delivered
- Order items with images
- Shipping address
- Payment details
- Invoice download
- Cancel Order button (if pending)
- Return/Exchange button (if delivered)

**Current Status:** Detail view exists but may be simplified.

**Gaps:**
- Missing: Visual status timeline
- Missing: Invoice download
- Missing: Cancel order action
- Missing: Return/Exchange flow

---

#### Addresses (`/account/addresses`)

**Target Design:**
- List of saved addresses
- Each address card: Name, Address, City, State, Pincode, Phone
- "Default" badge on primary address
- Edit/Delete actions per address
- "Add New Address" button
- Set as Default toggle

**Current Status:** Address management exists.

**Gaps:**
- Missing: Address card design (currently basic list)
- Missing: Default badge styling

---

#### Wallet (`/account/wallet`)

**Target Design:**
- Available balance card
- Transaction history table
- Transaction types: Order payment, Refund, Cashback
- Filter by type/date

**Current Status:** Basic wallet page exists.

**Gaps:**
- Missing: Detailed transaction types
- Missing: Balance breakdown

---

#### Wishlist (`/account/wishlist`)

**Target Design:**
- Grid of saved products
- Product cards with image, name, price
- "Move to Cart" button
- "Remove" button
- Empty state with CTA

**Current Status:** Wishlist page exists.

**Gaps:**
- Missing: Move to Cart with variant selection

---

#### Profile (`/account/profile`)

**Target Design:**
- Avatar with upload
- Name, Email (read-only), Phone
- Change password section
- Save button
- Form validation

**Current Status (`src/app/account/profile/page.tsx`):**
- ✅ Form fields: Name, Email, Phone
- ✅ Save button
- ✅ Fixed: useEffect populates fields on load
- ❌ Missing: Avatar upload
- ❌ Missing: Change password section
- ❌ Missing: Form validation feedback

---

### 8.9 Auth Pages

#### Login (`/auth/login`)

**Target Design:**
- Split layout: Image/brand left, form right
- Email + Password fields
- "Remember me" checkbox
- "Forgot password?" link
- "Sign In" button
- "Don't have an account? Sign Up" link
- Social login buttons (Google)
- Form validation with error messages

**Current Status:** Login form exists.

**Gaps:**
- Missing: Split layout design
- Missing: Social login (Google)
- Missing: Remember me

---

#### Register (`/auth/register`)

**Target Design:**
- Name, Email, Phone, Password, Confirm Password
- Terms acceptance checkbox
- "Sign Up" button
- "Already have an account? Sign In" link
- Email verification flow

**Current Status:** Register form exists.

**Gaps:**
- Missing: Phone field
- Missing: Confirm Password
- Missing: Terms checkbox
- Missing: Email verification (not implemented)

---

#### Forgot Password (`/auth/forgot-password`)

**Target Design:**
- Email input
- "Send Reset Link" button
- Success message
- Back to login link

**Current Status:** Form exists.

**Gaps:**
- Missing: Actual email sending implementation

---

### 8.10 Static Pages

#### About (`/about`)

**Target Design:**
- Hero image with overlay
- Company story text
- Team section
- Mission/Values cards
- Stats counters
- Partner/franchise logos

**Current Status:** Basic about page.

**Gaps:**
- Missing: Hero section
- Missing: Team section
- Missing: Stats counters
- Missing: Partner logos

---

#### Contact (`/contact`)

**Target Design:**
- Two columns: Contact form left, Info right
- Form: Name, Email, Phone, Subject, Message
- Info: Address, Phone, Email, Hours, Map
- Social links

**Current Status:** Basic contact page.

**Gaps:**
- Missing: Map integration
- Missing: Form validation
- Missing: Actual form submission handling

---

#### Franchise (`/franchise`)

**Target Design:**
- Hero banner: "Become a Franchise Partner"
- Benefits section (icons + text)
- Investment details
- How it works steps
- Application form (CTA to `/franchise/apply`)
- Testimonials from existing franchisees

**Current Status:** Basic franchise page + application form.

**Gaps:**
- Missing: Benefits section
- Missing: Investment details
- Missing: How it works
- Missing: Franchisee testimonials

---

### 8.11 Franchise Application (`/franchise/apply`)

**Target Design:**
- Form: Full Name, Email, Phone, City, Investment Capacity (dropdown), Retail Space (dropdown)
- "Submit Application" button
- Success message/confirmation

**Current Status:** Form exists with all fields.

**Gaps:**
- ✅ Matches target design well

---

## 9. MISSING CUSTOMER-FACING PAGES

| Page | Route | Priority |
|------|-------|----------|
| Size Guide | `/size-guide` | Medium |
| FAQ | `/faq` | Medium |
| Terms & Conditions | `/terms` | Medium |
| Privacy Policy | `/privacy` | Medium |
| Return & Refund Policy | `/returns` | Medium |
| Shipping Policy | `/shipping` | Low |
| Track Order | `/track-order` | Medium |
| Blog/Articles | `/blog` | Low |
| Careers | `/careers` | Low |

---

## 10. MISSING GLOBAL FEATURES

### 10.1 Search & Discovery
- ❌ Search autocomplete/suggestions in header
- ❌ Search result page with filters
- ❌ Voice search
- ❌ Visual search
- ❌ Product comparison feature

### 10.2 Personalization
- ❌ Recently viewed products
- ❌ Recommended products ("You May Also Like")
- ❌ Personalized homepage based on browsing
- ❌ Browse history

### 10.3 Notifications
- ❌ Toast notifications for actions (partial — react-hot-toast exists)
- ❌ Push notifications
- ❌ Email notifications (order confirmation, shipping, etc.)
- ❌ SMS notifications (OTP, order updates)

### 10.4 Wishlist
- ❌ Quick add to wishlist from product grid (hover heart)
- ❌ Wishlist count in header
- ❌ Move to cart with variant selection

### 10.5 Reviews
- ❌ Average rating display on product cards
- ❌ Review helpfulness voting
- ❌ Verified purchase badge on reviews

### 10.6 Mobile Experience
- ❌ Bottom navigation bar (Home, Shop, Cart, Account, Wishlist)
- ❌ Pull-to-refresh
- ❌ Swipe gestures on product images
- ❌ Mobile-optimized filters (bottom sheet)

### 10.7 Performance
- ❌ Image lazy loading with blur placeholder
- ❌ Skeleton loaders for all async content
- ❌ Prefetching on hover for navigation

---

## 11. UPDATED PRIORITY ROADMAP

### Phase 1: Critical (Blocking or High Impact)
1. ✅ Franchise Application Approval flow (DONE)
2. Fix Admin/Super Admin charts and data tables (search, filters, pagination)
3. Product detail page: Zoom, color swatches, related products
4. Cart: Coupon code input, move to wishlist
5. Checkout: Inline address add, tax line, success page polish
6. Profile: Avatar upload, change password

### Phase 2: UX Improvements
7. Shop page: More filters (size, color, brand, rating), pagination
8. Home page: Testimonials, Instagram feed, newsletter popup
9. Search: Autocomplete/suggestions
10. Product cards: Quick view on hover, wishlist hover button
11. Order tracking: Visual timeline, cancel/return actions
12. Static pages: Size guide, FAQ, Terms, Privacy

### Phase 3: Engagement & Polish
13. Email notifications (order confirmation, shipping, password reset)
14. Push notifications
15. Recently viewed products
16. "You May Also Like" recommendations
17. Mobile bottom navigation
18. Image zoom and swipe on product detail
19. Review enhancements (helpful voting, verified badge)
20. Social sharing on products

---

*Full Audit Completed — Admin + Customer-Facing Website*

