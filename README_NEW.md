# Pneuma Christian BookStore

A modern, free Christian book library built with React, TailwindCSS, and Appwrite. This application allows users to browse, download, and manage a collection of Christian literature with a beautiful, Spotify-inspired interface.

## ✨ Features

### 📚 Book Management
- Browse curated collection of Christian books
- Advanced search by title, author, or genre
- Filter by categories (Featured, Bestseller, New Release)
- Detailed book pages with ratings and descriptions
- **Free PDF downloads** for all books
- Optional audiobook links (MP3 format)
- Comprehensive book metadata (ISBN, publisher, pages, etc.)

### 🎨 Modern UI/UX
- **Dark theme** with Aurora background effects
- **Responsive design** (mobile, tablet, desktop)
- **Spotify-inspired** audio player interface
- Professional book cards with hover effects
- Smooth animations and transitions
- **Glass morphism** design elements

### 👤 User Features
- **User authentication** with Appwrite
- Personal library management
- **Favorites system** with real-time sync
- **Download history** tracking
- User profiles and preferences

### 🔧 Admin Features
- **Admin dashboard** with analytics
- **Comprehensive book upload** with metadata
- User management and roles
- Download statistics and insights
- **File management** with Appwrite Storage

### 🚀 Backend Integration
- **Appwrite** for backend services
- **Real-time database** with Appwrite Database
- **File storage** with Cloudflare R2
- **Authentication** with Appwrite Auth
- **Appwrite Storage** integration (alternative)

## 🛠️ Tech Stack

**Frontend:**
- React 19.1.0
- React Router DOM 7.6.2
- TailwindCSS 4.1.10
- Lucide React (icons)
- OGL (WebGL Aurora effects)
- Framer Motion (animations)

**Backend:**
- **Appwrite** (Database, Auth)
- **Cloudflare R2** (Primary file storage)
- **Appwrite Storage** (Alternative file storage)

**Development:**
- Vite (build tool)
- ESLint (code quality)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Appwrite account (cloud or self-hosted)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd pastor-proj
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up Appwrite**
Follow the detailed [Appwrite Setup Guide](./APPWRITE_SETUP.md)

4. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your Appwrite credentials
```

5. **Start development server**
```bash
npm run dev
```

6. **Open your browser**
Navigate to `http://localhost:5173`

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # UI primitives (Aurora, LoaderOne, etc.)
│   ├── BookCard.jsx    # Book display component
│   ├── Sidebar.jsx     # Navigation sidebar
│   ├── AuthModal.jsx   # Authentication modal
│   └── AudioPlayer.jsx # Audio player components
├── pages/              # Page components
│   ├── Home.jsx        # Main discovery page
│   ├── BookDetail.jsx  # Individual book page
│   ├── Library.jsx     # User's library
│   ├── Favorites.jsx   # Favorite books
│   ├── Downloads.jsx   # Download history
│   └── Admin/          # Admin pages
├── services/           # API and data services
│   ├── api.js          # Main API service
│   └── appwrite/       # Appwrite service modules
├── contexts/           # React contexts
│   └── AuthContext.jsx # Authentication context
├── lib/                # Utility libraries
│   └── appwrite.js     # Appwrite configuration
└── assets/             # Static assets
```

## 🎨 Design System

### Colors
- **Primary Green**: #11b53f
- **Dark Background**: #111827 (gray-900)
- **Card Background**: #1f2937 (gray-800)
- **Text**: White/Gray variants
- **Aurora**: Green gradient effects

### Components
- **Aurora Background**: Animated WebGL gradient effects
- **Glass Morphism**: Backdrop blur with transparency
- **LoaderOne**: Custom animated loader component
- **Responsive Grid**: 2 cols mobile, 4 cols tablet, 5 cols desktop

## 📱 Responsive Design

- **Mobile**: Optimized touch interface with bottom navigation
- **Tablet**: Balanced layout with sidebar
- **Desktop**: Full sidebar with detailed information
- **Fixed sidebar** behavior (Spotify-style)

## 🔒 Authentication & Authorization

### User Roles
- **Regular Users**: Browse, download, favorite books (unlimited users)
- **Admin**: One special email address gets full admin access

### Admin Email System
- **Single Admin Email**: Only one email (configurable) gets admin privileges
- **Automatic Role Assignment**: Admin role assigned automatically on registration
- **Secure Access**: Double verification (email + role) for admin features

### Features
- **Secure authentication** with Appwrite Auth
- **Email-based admin access** (no manual role changes needed)
- **Password reset** functionality
- **User profile management**

## 📦 Deployment

### Frontend Deployment
**Recommended: Vercel or Netlify**

1. **Build the project**
```bash
npm run build
```

2. **Deploy to Vercel**
```bash
npx vercel --prod
```

3. **Set environment variables** in your deployment platform

### Backend (Appwrite)
- **Appwrite Cloud**: Fully managed (recommended)
- **Self-hosted**: Deploy on your own infrastructure

### File Storage
- **Cloudflare R2**: Primary file storage (recommended)
- **Appwrite Storage**: Alternative built-in file storage

## 🔧 Configuration

### Environment Variables
```env
# Appwrite Configuration
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_DATABASE_ID=your_database_id

# Collection IDs
VITE_APPWRITE_BOOKS_COLLECTION_ID=books
VITE_APPWRITE_USERS_COLLECTION_ID=users
VITE_APPWRITE_DOWNLOADS_COLLECTION_ID=downloads
VITE_APPWRITE_FAVORITES_COLLECTION_ID=favorites

# Storage Bucket IDs (Appwrite fallback)
VITE_APPWRITE_BOOKS_BUCKET_ID=books-pdfs
VITE_APPWRITE_COVERS_BUCKET_ID=book-covers

# Cloudflare R2 Configuration (Primary Storage)
VITE_CLOUDFLARE_R2_ACCOUNT_ID=your_account_id
VITE_CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key
VITE_CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_key
VITE_CLOUDFLARE_R2_BUCKET_NAME=pneuma-bookstore
VITE_CLOUDFLARE_R2_PUBLIC_URL=https://your-bucket.your-account.r2.cloudflarestorage.com
```

### Storage Strategy
The application uses a **hybrid storage approach**:

1. **Primary**: Cloudflare R2 (when configured)
   - Better performance and CDN
   - Lower costs for large files
   - Global edge locations

2. **Fallback**: Appwrite Storage
   - Built-in with Appwrite
   - Easier setup for development
   - Automatic when R2 is not configured

## ✅ Features Checklist

| Feature | Status |
|---------|--------|
| User authentication | ✅ |
| Book upload (PDF + image) | ✅ |
| Comprehensive book metadata | ✅ |
| Optional MP3 audiobook link | ✅ |
| Book listing for users | ✅ |
| Book detail page | ✅ |
| Admin dashboard | ✅ |
| User management | ✅ |
| Favorites system | ✅ |
| Download tracking | ✅ |
| Free book downloads | ✅ |
| Responsive design | ✅ |
| Aurora background effects | ✅ |
| Spotify-inspired UI | ✅ |

## 🧪 Future Improvements

- Add user download analytics
- Implement book recommendations
- Add search filters by genre/author
- Add book reviews and ratings
- Add audio player for MP3 links
- Add book collections/playlists
- Add social sharing features
- Add offline reading capabilities

## 🧑‍💻 Credits

**Frontend**: React + TailwindCSS + Appwrite
**Backend**: Appwrite (Database, Auth, Storage)
**File Storage**: Appwrite Storage + Cloudflare R2 (optional)
**Design**: Spotify-inspired dark theme with Aurora effects

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the [Appwrite Setup Guide](./APPWRITE_SETUP.md)
- Review the documentation

---

**Built with ❤️ for the Christian community**
