📚 Pneuma BookStore – Christian Book Library
🧾 Project Summary
The Pneuma BookStore is a modern web application that allows users to browse and view Christian books, while the Admin Dashboard enables authenticated admins to:

✅ Upload new books (PDF + cover image)
✅ Add an optional audiobook link (MP4 link only)
✅ Manage uploaded books
✅ View registered users
✅ Browse books with real cover images
✅ Responsive design with beautiful UI

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation & Running
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`

### Available Routes
- `/` - Home page with book library
- `/book/:id` - Individual book details
- `/admin` - Admin dashboard
- `/admin/upload` - Upload new books

## 📖 Demo Books
The application comes with demo Christian books including:
- The Purpose Driven Life by Rick Warren
- Jesus Calling by Sarah Young
- Mere Christianity by C.S. Lewis
- The Case for Christ by Lee Strobel
- Crazy Love by Francis Chan
- The Screwtape Letters by C.S. Lewis

🔧 Tech Stack
Layer	Technology
Frontend	React + Vite + Tailwind CSS
Backend	Node.js + Express
Database	Neon (PostgreSQL, via Prisma ORM)
File Uploads	Multer (local or use Cloudinary/S3)
ORM	Prisma
Auth (Optional)	Clerk, Supabase, or custom JWT

📁 Project Structure
pgsql
Copy
Edit
bookstore-app/
├── backend/
│   ├── server.js
│   ├── routes/
│   │   └── books.js
│   ├── controllers/
│   ├── uploads/ (for PDF/image files)
│   └── prisma/
│       └── schema.prisma
├── frontend/
│   ├── index.html
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── BookDetail.jsx
│   │   │   └── Admin/
│   │   │       ├── Dashboard.jsx
│   │   │       └── UploadBook.jsx
│   │   ├── components/
│   │   └── services/api.js
├── .env
├── package.json
└── README.md
🧩 Database Schema (Prisma + Neon)
prisma
Copy
Edit
model Book {
  id          String   @id @default(cuid())
  title       String
  author      String
  description String
  pdfUrl      String
  coverUrl    String
  audioLink   String?
  createdAt   DateTime @default(now())
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  createdAt DateTime @default(now())
}
🌐 Frontend
Admin Upload Book Form (UploadBook.jsx)
Fields:

title (text)

author (text)

description (textarea)

audioLink (optional URL)

pdfFile (file input for .pdf)

coverImage (file input for image)

On submit:

Send multipart/form-data via axios to backend /api/books.

🛠 Backend
Express Setup
Use multer to handle file uploads (for PDFs and cover images).

Store files locally in uploads/ or upload to Cloudinary/S3 in production.

js
Copy
Edit
// POST /api/books
Fields: title, author, description, audioLink, pdfFile, coverImage
Book Route Logic (books.js)
js
Copy
Edit
router.post('/', upload.fields([...]), async (req, res) => {
  const book = await prisma.book.create({
    data: {
      title, author, description,
      pdfUrl: '/uploads/filename.pdf',
      coverUrl: '/uploads/image.jpg',
      audioLink: 'https://link.com/audio.mp4',
    }
  })
})
🔒 Authentication (Admin)
Optional, but recommended.

Use any of the following:

Clerk.dev – simple admin user roles

Supabase Auth – restrict access to admin dashboard

Custom JWT – simple middleware for route protection

📦 Deployment
Frontend:
Deploy via Netlify or Vercel

Backend:
Deploy via Render, Railway, or Fly.io

Database:
Neon.tech (Free-tier PostgreSQL)

Assets (PDF/Image):
Use Cloudinary or AWS S3 for file hosting

✅ Features Checklist
Feature	Done?
Admin login (auth middleware)	⬜️
Book upload (PDF + image)	✅
Optional MP4 audiobook link	✅
Book listing for users	✅
User registration/login	⬜️
Book detail page	✅
Admin dashboard	✅
View users in dashboard	⬜️
Free book downloads	✅

🧪 Future Improvements
Add user download tracking

Add download restrictions (optional)

Add search, filters by genre/author

Add user analytics in admin panel

Add audio player for MP4 links

🧑‍💻 Credits
Frontend: React + TailwindCSS

Backend: Express + Prisma

DB: Neon PostgreSQL

File Uploads: Multer (local), recommend Cloudinary/S3 for production