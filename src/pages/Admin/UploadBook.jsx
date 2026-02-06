import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, X, FileText, Image, Headphones, Calendar, BookOpen, Globe, Star, Hash, Tag, Plus } from 'lucide-react';
import { Aurora } from '../../components/ui/aurora';
import LoaderOne from '../../components/ui/loader-one';
import { booksApi } from '../../services/newApi';
import { uploadBookCover, uploadBookPDF } from '../../config/cloudinary';
import { useAuth } from '../../contexts/BetterAuthContext';
import { useModal } from '../../contexts/ModalContext';

const UploadBook = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { showError, showSuccess } = useModal();

  // Redirect if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400">You need admin privileges to access this page.</p>
          <Link to="/" className="mt-4 inline-block px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  // Predefined options
  const [genres, setGenres] = useState([
    'Christian Living',
    'Devotional',
    'Theology',
    'Apologetics',
    'Biblical Studies',
    'Prayer',
    'Worship',
    'Discipleship',
    'Evangelism',
    'Church History',
    'Biography',
    'Fiction',
    'Youth',
    'Children',
    'Family',
    'Marriage',
    'Leadership',
    'Missions',
    'Prophecy',
    'Spiritual Growth'
  ]);

  const [categories, setCategories] = useState([
    'Featured',
    'Bestseller',
    'New Release',
    'Classic',
    'Contemporary',
    'Academic',
    'Popular',
    'Reference'
  ]);

  const languages = [
    'English',
    'Swahili',
    'French',
    'Luganda'
  ];
  const [formData, setFormData] = useState({
    // Basic Information
    title: '',
    author: '',
    description: '',
    fullDescription: '',

    // Classification
    genre: '',
    category: '',
    tags: [],

    // Publication Details
    publisher: '',
    publishedDate: '',
    isbn: '',
    language: 'English',
    pages: '',

    // Rating & Reviews
    rating: '',
    totalRatings: '',

    // Media Links
    audioLink: '',
    previewLink: '',

    // Payment
    isFree: true,
    price: '',

    // Status
    featured: false,
    bestseller: false,
    newRelease: false
  });
  const [newGenre, setNewGenre] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [files, setFiles] = useState({
    pdfFile: null,
    coverImage: null
  });
  const [previews, setPreviews] = useState({
    coverImage: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddGenre = () => {
    if (newGenre.trim() && !genres.includes(newGenre.trim())) {
      const updatedGenres = [...genres, newGenre.trim()].sort();
      setGenres(updatedGenres);
      setFormData(prev => ({ ...prev, genre: newGenre.trim() }));
      setNewGenre('');
    }
  };

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      const updatedCategories = [...categories, newCategory.trim()].sort();
      setCategories(updatedCategories);
      setFormData(prev => ({ ...prev, category: newCategory.trim() }));
      setNewCategory('');
    }
  };

  const handleTagAdd = (tagText) => {
    if (tagText.trim() && !formData.tags.includes(tagText.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagText.trim()]
      }));
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const [newTag, setNewTag] = useState('');

  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (file) {
      setFiles(prev => ({
        ...prev,
        [fileType]: file
      }));

      // Create preview for cover image
      if (fileType === 'coverImage' && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviews(prev => ({
            ...prev,
            coverImage: e.target.result
          }));
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const removeFile = (fileType) => {
    setFiles(prev => ({
      ...prev,
      [fileType]: null
    }));
    if (fileType === 'coverImage') {
      setPreviews(prev => ({
        ...prev,
        coverImage: null
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Check if user is admin
      if (!isAdmin) {
        alert('Unauthorized: Admin access required');
        return;
      }

      let coverFileUrl = '';
      let coverFileId = '';
      let pdfFileUrl = '';
      let pdfFileId = '';

      // Upload cover image if provided
      if (files.coverImage) {
        console.log('📤 Starting cover upload...');
        const coverResult = await uploadBookCover(files.coverImage);
        if (coverResult.success) {
          coverFileUrl = coverResult.url;
          coverFileId = coverResult.publicId;
          console.log('✅ Cover uploaded:', coverFileUrl);
        } else {
          console.error('❌ Cover upload failed:', coverResult.error);
          throw new Error(`Cover upload failed: ${coverResult.error}`);
        }
      }

      // Upload PDF if provided
      if (files.pdfFile) {
        console.log('📤 Starting PDF upload...');
        const pdfResult = await uploadBookPDF(files.pdfFile);
        if (pdfResult.success) {
          pdfFileUrl = pdfResult.url;
          pdfFileId = pdfResult.publicId;
          console.log('✅ PDF uploaded:', pdfFileUrl);
        } else {
          console.error('❌ PDF upload failed:', pdfResult.error);
          throw new Error(`PDF upload failed: ${pdfResult.error}`);
        }
      }

      // Prepare book data with proper field names
      const bookData = {
        title: formData.title,
        author: formData.author,
        description: formData.description,
        full_description: formData.fullDescription,
        genre: formData.genre,
        category: formData.category,
        tags: formData.tags.join(','), // Convert array to string
        publisher: formData.publisher,
        published_date: formData.publishedDate,
        isbn: formData.isbn,
        language: formData.language,
        pages: parseInt(formData.pages) || 0,
        rating: parseFloat(formData.rating) || 0,
        total_ratings: parseInt(formData.totalRatings) || 0,
        audio_link: formData.audioLink,
        preview_link: formData.previewLink,
        cover_file_url: coverFileUrl,
        cover_file_id: coverFileId,
        pdf_file_url: pdfFileUrl,
        pdf_file_id: pdfFileId,
        is_free: formData.isFree,
        price: formData.isFree ? 0 : parseInt(formData.price) || 0,
        featured: formData.featured,
        bestseller: formData.bestseller,
        new_release: formData.newRelease,
        downloads: 0
      };

      console.log('📚 Book data prepared:', bookData);

      // Create book in database
      console.log('📚 Creating book in database...');
      const result = await booksApi.create(bookData);

      if (result.success) {
        console.log('✅ Book created successfully:', result);

        // Reset form
        setFormData({
          title: '', author: '', description: '', fullDescription: '',
          genre: '', category: '', tags: [], publisher: '', publishedDate: '',
          isbn: '', language: 'English', pages: '', rating: '', totalRatings: '',
          audioLink: '', previewLink: '', isFree: true, price: '',
          featured: false, bestseller: false, newRelease: false
        });
        setFiles({ coverImage: null, pdfFile: null });
        setPreviews({ coverImage: null });
        setNewGenre('');
        setNewCategory('');

        showSuccess('Book uploaded successfully! Cover and PDF are now stored in Cloudinary.', 'Upload Complete');
        navigate('/admin/books');
      } else {
        throw new Error(result.error || 'Failed to create book in database');
      }
    } catch (error) {
      console.error('❌ Upload failed:', error);
      showError(`Upload failed: ${error.message}`, 'Upload Failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Dark Aurora Background - Full Coverage */}
      <div className="fixed inset-0 w-full h-full opacity-50 z-0">
        <Aurora
          colorStops={["#0d8a2f", "#1f2937", "#11b53f"]}
          blend={0.4}
          amplitude={0.6}
          speed={0.12}
          className="w-full h-full"
        />
      </div>

      {/* Dark overlay for better readability */}
      <div className="fixed inset-0 w-full h-full bg-gray-900/30 z-0"></div>

      <main className="min-h-screen relative z-20 md:ml-60 lg:ml-80 p-4 md:p-8 pb-32 md:pb-24">
        <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link
            to="/admin"
            className="flex items-center gap-2 transition-colors mr-4 hover:opacity-80 bg-gray-800/30 px-4 py-2 rounded-xl border border-gray-700/30"
            style={{color: '#11b53f'}}
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">Upload New Book</h1>
            <p className="text-gray-300 mt-1">Add a new book to your library</p>
          </div>
        </div>

        {/* Upload Form */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-md p-8 shadow-2xl border border-gray-700/30">
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Basic Information Section */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white border-b border-gray-700/50 pb-2">
                Basic Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-white mb-2">
                    Book Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200"
                    placeholder="Enter book title"
                  />
                </div>

                <div>
                  <label htmlFor="author" className="block text-sm font-medium text-white mb-2">
                    Author *
                  </label>
                  <input
                    type="text"
                    id="author"
                    name="author"
                    value={formData.author}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200"
                    placeholder="Enter author name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
                  Short Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200"
                  placeholder="Brief description for book cards"
                />
              </div>

              <div>
                <label htmlFor="fullDescription" className="block text-sm font-medium text-white mb-2">
                  Full Description *
                </label>
                <textarea
                  id="fullDescription"
                  name="fullDescription"
                  value={formData.fullDescription}
                  onChange={handleInputChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200"
                  placeholder="Detailed description for book detail page"
                />
              </div>
            </div>

            {/* Classification Section */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white border-b border-gray-700/50 pb-2">
                Classification
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Genre Selection */}
                <div>
                  <label htmlFor="genre" className="block text-sm font-medium text-white mb-2">
                    Genre *
                  </label>
                  <div className="space-y-3">
                    {/* Dropdown */}
                    <select
                      id="genre"
                      name="genre"
                      value={formData.genre}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200"
                    >
                      <option value="">Select Genre</option>
                      {genres.map(genre => (
                        <option key={genre} value={genre} className="bg-gray-800">
                          {genre}
                        </option>
                      ))}
                    </select>
                    
                    {/* Add New Genre */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newGenre}
                        onChange={(e) => setNewGenre(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddGenre();
                          }
                        }}
                        placeholder="Add new genre..."
                        className="flex-1 px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200"
                      />
                      <button
                        type="button"
                        onClick={handleAddGenre}
                        disabled={!newGenre.trim()}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                {/* Category Selection */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-white mb-2">
                    Category
                  </label>
                  <div className="space-y-3">
                    {/* Dropdown */}
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200"
                    >
                      <option value="">Select Category</option>
                      {categories.map(category => (
                        <option key={category} value={category} className="bg-gray-800">
                          {category}
                        </option>
                      ))}
                    </select>
                    
                    {/* Add New Category */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCategory();
                          }
                        }}
                        placeholder="Add new category..."
                        className="flex-1 px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200"
                      />
                      <button
                        type="button"
                        onClick={handleAddCategory}
                        disabled={!newCategory.trim()}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Tags
                </label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleTagAdd(newTag);
                            setNewTag('');
                          }
                        }}
                        className="w-full pl-12 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200"
                        placeholder="Add tags (press Enter)"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        handleTagAdd(newTag);
                        setNewTag('');
                      }}
                      className="px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>

                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 md:gap-2">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-green-600/20 text-green-400 rounded-md text-xs md:text-sm border border-green-500/30"
                        >
                          <span className="truncate max-w-[80px] md:max-w-none">{tag}</span>
                          <button
                            type="button"
                            onClick={() => handleTagRemove(tag)}
                            className="text-green-400 hover:text-red-400 transition-colors flex-shrink-0"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Publication Details Section */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white border-b border-gray-700/50 pb-2">
                Publication Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="publisher" className="block text-sm font-medium text-white mb-2">
                    Publisher
                  </label>
                  <input
                    type="text"
                    id="publisher"
                    name="publisher"
                    value={formData.publisher}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200"
                    placeholder="Publisher name"
                  />
                </div>

                <div>
                  <label htmlFor="publishedDate" className="block text-sm font-medium text-white mb-2">
                    Publication Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="date"
                      id="publishedDate"
                      name="publishedDate"
                      value={formData.publishedDate}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="isbn" className="block text-sm font-medium text-white mb-2">
                    ISBN
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      id="isbn"
                      name="isbn"
                      value={formData.isbn}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200"
                      placeholder="978-0-123456-78-9"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="language" className="block text-sm font-medium text-white mb-2">
                    Language *
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      id="language"
                      name="language"
                      value={formData.language}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-12 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200"
                    >
                      {languages.map(language => (
                        <option key={language} value={language} className="bg-gray-800">
                          {language}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="pages" className="block text-sm font-medium text-white mb-2">
                    Pages
                  </label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      id="pages"
                      name="pages"
                      value={formData.pages}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full pl-12 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200"
                      placeholder="Number of pages"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Rating Section */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white border-b border-gray-700/50 pb-2">
                Rating & Reviews
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="rating" className="block text-sm font-medium text-white mb-2">
                    Average Rating
                  </label>
                  <div className="relative">
                    <Star className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      id="rating"
                      name="rating"
                      value={formData.rating}
                      onChange={handleInputChange}
                      min="0"
                      max="5"
                      step="0.1"
                      className="w-full pl-12 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200"
                      placeholder="4.5"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="totalRatings" className="block text-sm font-medium text-white mb-2">
                    Total Ratings
                  </label>
                  <input
                    type="number"
                    id="totalRatings"
                    name="totalRatings"
                    value={formData.totalRatings}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200"
                    placeholder="1247"
                  />
                </div>
              </div>
            </div>

            {/* Media Links Section */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white border-b border-gray-700/50 pb-2">
                Media Links
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="audioLink" className="block text-sm font-medium text-white mb-2">
                    Audiobook Link
                  </label>
                  <div className="relative">
                    <Headphones className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="url"
                      id="audioLink"
                      name="audioLink"
                      value={formData.audioLink}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200"
                      placeholder="https://example.com/audiobook.mp3"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">MP3 audio file link</p>
                </div>

                <div>
                  <label htmlFor="previewLink" className="block text-sm font-medium text-white mb-2">
                    Preview Link
                  </label>
                  <input
                    type="url"
                    id="previewLink"
                    name="previewLink"
                    value={formData.previewLink}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200"
                    placeholder="https://example.com/preview"
                  />
                  <p className="text-xs text-gray-400 mt-1">Link to book preview or sample</p>
                </div>
              </div>
            </div>

            {/* Payment Section */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white border-b border-gray-700/50 pb-2">
                Payment Information
              </h3>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="isFree"
                    name="isFree"
                    checked={formData.isFree}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500 focus:ring-2"
                  />
                  <label htmlFor="isFree" className="text-white font-medium">
                    This book is free
                  </label>
                </div>

                {!formData.isFree && (
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-white mb-2">
                      Price (UGX)
                    </label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      min="0"
                      step="1"
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200"
                      placeholder="20"
                    />
                    <p className="text-xs text-gray-400 mt-1">Enter price in Ugandan Shillings (UGX)</p>
                  </div>
                )}
              </div>
            </div>

            {/* Status Section */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white border-b border-gray-700/50 pb-2">
                Book Status
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="featured"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500 focus:ring-2"
                  />
                  <label htmlFor="featured" className="text-white font-medium">
                    Featured Book
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="bestseller"
                    name="bestseller"
                    checked={formData.bestseller}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500 focus:ring-2"
                  />
                  <label htmlFor="bestseller" className="text-white font-medium">
                    Bestseller
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="newRelease"
                    name="newRelease"
                    checked={formData.newRelease}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500 focus:ring-2"
                  />
                  <label htmlFor="newRelease" className="text-white font-medium">
                    New Release
                  </label>
                </div>
              </div>
            </div>

            {/* File Uploads Section */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white border-b border-gray-700/50 pb-2">
                File Uploads
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* PDF Upload */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  PDF File *
                </label>
                <div className="border-2 border-dashed border-gray-600/50 rounded-xl p-6 text-center bg-gray-700/20 backdrop-blur-sm">
                  {files.pdfFile ? (
                    <div className="flex items-center justify-between bg-gray-600/30 rounded-xl p-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-red-400" />
                        <span className="text-sm text-white truncate">{files.pdfFile.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile('pdfFile')}
                        className="text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-300 mb-2">Upload PDF file</p>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handleFileChange(e, 'pdfFile')}
                        className="hidden"
                        id="pdfFile"
                      />
                      <label
                        htmlFor="pdfFile"
                        className="inline-block px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl text-sm font-medium cursor-pointer hover:from-green-700 hover:to-green-600 transition-all duration-200 shadow-lg"
                      >
                        Choose File
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Cover Image Upload */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Cover Image *
                </label>
                <div className="border-2 border-dashed border-gray-600/50 rounded-xl p-6 text-center bg-gray-700/20 backdrop-blur-sm">
                  {previews.coverImage ? (
                    <div className="relative">
                      <img
                        src={previews.coverImage}
                        alt="Cover preview"
                        className="w-24 h-32 object-cover rounded-xl mx-auto mb-2 shadow-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeFile('coverImage')}
                        className="absolute top-0 right-1/2 transform translate-x-1/2 -translate-y-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors shadow-lg"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <p className="text-xs text-gray-400">{files.coverImage?.name}</p>
                    </div>
                  ) : (
                    <div>
                      <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-300 mb-2">Upload cover image</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'coverImage')}
                        className="hidden"
                        id="coverImage"
                      />
                      <label
                        htmlFor="coverImage"
                        className="inline-block px-4 py-2 bg-gray-700/50 border border-gray-600/50 text-gray-300 rounded-xl text-sm font-medium cursor-pointer hover:bg-gray-600/50 hover:text-white transition-all duration-200 backdrop-blur-sm"
                      >
                        Choose Image
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-700/50">
              <Link
                to="/admin"
                className="px-6 py-3 border border-gray-600/50 text-gray-300 rounded-xl font-medium hover:bg-gray-700/30 hover:text-white transition-colors backdrop-blur-sm"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting || !formData.title || !formData.author || !formData.description || !formData.fullDescription || !formData.genre || !formData.language || !files.pdfFile || !files.coverImage}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl font-medium hover:from-green-700 hover:to-green-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
              >
                {isSubmitting ? (
                  <>
                    <div className="scale-75">
                      <LoaderOne />
                    </div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload Book
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
        </div>
      </main>
    </div>
  );
};

export default UploadBook;

