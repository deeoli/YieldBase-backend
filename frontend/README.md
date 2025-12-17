# YieldBase - UK Property Investment Platform

A fully responsive Next.js frontend platform for UK property investment, focused on 2–3+ bedroom houses near UK universities.

## 🚀 Features

- **Property Listings**: Browse and filter properties with detailed information
- **Property Details**: Comprehensive property pages with galleries and enquiry forms
- **Yield Calculator**: Calculate rental yields with a free daily limit (3 calculations/day)
- **Responsive Design**: Mobile-first, fully responsive UI
- **Configurable Data Layer**: Support for scraper API or external API
- **SEO Optimized**: Built with Next.js App Router for optimal SEO

## 🛠️ Tech Stack

- **Next.js 14+** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Headless UI (modals & overlays)**
- **Deployed on Vercel**

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory:
```env
# Data Source Configuration
# Options: 'scraper' or 'api'
NEXT_PUBLIC_DATA_SOURCE=scraper

# Scraper API Configuration (used when DATA_SOURCE=scraper)
NEXT_PUBLIC_SCRAPER_API_BASE_URL=https://my-backend.com

# External API Configuration (used when DATA_SOURCE=api)
NEXT_PUBLIC_EXTERNAL_API_BASE_URL=https://api.external.com
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Configuration

### Data Source Configuration

The platform supports two data source modes:

1. **Scraper Mode** (`NEXT_PUBLIC_DATA_SOURCE=scraper`):
   - Uses `NEXT_PUBLIC_SCRAPER_API_BASE_URL` to fetch properties
   - Expected endpoint: `${SCRAPER_API_BASE_URL}/properties`
   - Individual property: `${SCRAPER_API_BASE_URL}/properties/${id}`

2. **API Mode** (`NEXT_PUBLIC_DATA_SOURCE=api`):
   - Uses `NEXT_PUBLIC_EXTERNAL_API_BASE_URL` to fetch properties
   - Expected endpoint: `${EXTERNAL_API_BASE_URL}/properties`
   - Individual property: `${EXTERNAL_API_BASE_URL}/properties/${id}`

3. **Fallback Mode** (no API configured):
   - Uses mock data for development/testing

### API Endpoints

The platform includes the following API routes:

- `GET /api/properties` - Fetch properties with optional filters
- `POST /api/enquiry` - Submit property enquiry
- `POST /api/contact` - Submit contact form

### Backend Connection

To connect your backend:

1. Set the appropriate `NEXT_PUBLIC_DATA_SOURCE` in `.env.local`
2. Set the corresponding API base URL
3. Ensure your backend returns data in the expected format (see `types/property.ts`)

The `lib/getProperties.ts` file handles normalization of different API response formats.

## 🎨 Branding

### Colors
- **Primary Navy**: `#0B1F3B`
- **Accent Gold**: `#F4B41A`
- **Background Light**: `#F7F7FB`
- **Card Background**: `#FFFFFF`
- **Text Dark**: `#111827`
- **Muted Grey**: `#6B7280`
- **Border Grey**: `#E5E7EB`
- **High Yield BG**: `#DCFCE7`
- **High Yield Text**: `#166534`

### Fonts
- **Headings**: Poppins (600-700 weight)
- **Body**: Inter (400-500 weight)

## 📱 Pages

- `/` - Home page with hero, benefits, featured properties
- `/properties` - Property listings with filters
- `/properties/[id]` - Individual property detail page
- `/yield-calculator` - Yield calculator with free limit
- `/about` - About page
- `/contact` - Contact page with WhatsApp integration

## 🧮 Yield Calculator Limit Logic

The yield calculator implements a free daily limit system:

- **3 free calculations per day**
- Tracks usage via `localStorage`
- Resets daily at midnight (local time)
- On 4th attempt, shows modal with upgrade options
- Uses key: `yieldCalculatorLimit` with structure:
  ```json
  {
    "date": "Mon Jan 01 2024",
    "count": 2
  }
  ```

## 🚢 Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

The platform is optimized for Vercel deployment with Next.js App Router.

## 📝 API Integration

### Property Data Format

Your backend should return properties in this format (or compatible):

```typescript
{
  id: string;
  title: string;
  price: number;
  currency: string;
  address: string;
  city: string;
  postcode: string;
  beds: number;
  baths?: number;
  tenure?: string;
  yield?: number;
  description?: string;
  image: string;
  images?: string[];
  sourceUrl: string;
  isHighYield?: boolean;
  floorArea?: number;
  estimatedMonthlyRent?: number;
  estimatedAnnualRent?: number;
  features?: string[];
}
```

The `lib/getProperties.ts` file normalizes different response formats automatically.

## 🔒 Environment Variables

Required environment variables:

- `NEXT_PUBLIC_DATA_SOURCE` - Data source type ('scraper' or 'api')
- `NEXT_PUBLIC_SCRAPER_API_BASE_URL` - Scraper API base URL (if using scraper)
- `NEXT_PUBLIC_EXTERNAL_API_BASE_URL` - External API base URL (if using api)

## 📄 License

Private - All rights reserved

## 👥 Support

For support, contact info@yieldbase.com or use the contact form on the website.

---

Built for global investors. © 2024 YieldBase

