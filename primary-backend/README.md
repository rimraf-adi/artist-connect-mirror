# Artisan Connect Backend

An AI-driven platform backend for local artisans to market their craft, tell their stories, and expand their reach to new digital audiences.

## 🚀 Features

- **User Identity Management** - Complete artisan registration and profile management
- **Listings Creator** - Product listing management with images and inventory tracking
- **AI Storytelling Assistant** - Powered by Google Gemini for compelling content creation
- **AI Pricing Assistant** - Intelligent pricing suggestions based on market analysis
- **Inventory Management** - Real-time stock tracking and alerts
- **Order Management** - Cross-platform order processing and tracking
- **Social Media Analytics** - Instagram, Twitter, and other platform integration
- **Campaign Generator** - Automated marketing campaign creation
- **Competition Analysis** - AI-powered market insights
- **Brand Identity Assistant** - Colors, fonts, and brand guidelines
- **Review Aggregator** - Multi-platform review collection
- **Shipping Management** - Integration with Indian shipping providers
- **Skill Showcase** - Artisan skill verification and portfolio
- **Community & Collaboration** - Artisan networking and collaboration tools
- **Training & Guidance** - Educational modules and progress tracking

## 🛠️ Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **AI Integration**: Google Gemini AI
- **Caching**: Redis
- **Authentication**: JWT
- **File Upload**: Multer with Sharp for image processing
- **Validation**: Joi
- **Logging**: Winston
- **Containerization**: Docker & Docker Compose

## 📋 Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- npm or yarn

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd primary-backend
   ```

2. **Run the startup script**
   ```bash
   ./start.sh
   ```

   This will:
   - Install dependencies
   - Start PostgreSQL and Redis containers
   - Generate Prisma client
   - Set up the database schema
   - Start the development server

3. **Manual setup (alternative)**
   ```bash
   # Copy environment file
   cp env.example .env
   
   # Install dependencies
   npm install
   
   # Start Docker containers
   docker-compose up -d
   
   # Generate Prisma client
   npm run db:generate
   
   # Push database schema
   npm run db:push
   
   # Start development server
   npm run dev
   ```

## 🔧 Environment Configuration

Update the `.env` file with your configuration:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/artisan_connect?schema=public"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# Gemini AI
GEMINI_API_KEY="your-gemini-api-key"
GEMINI_MODEL="gemini-1.5-pro"

# Server
PORT=3000
NODE_ENV="development"
```

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register new artisan
- `POST /api/auth/login` - Login artisan
- `GET /api/auth/profile` - Get artisan profile
- `PUT /api/auth/profile` - Update artisan profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/logout` - Logout

### AI Assistant Endpoints

- `POST /api/ai/story/generate` - Generate storytelling content
- `GET /api/ai/stories` - Get artisan stories
- `PUT /api/ai/stories/:id` - Update story
- `DELETE /api/ai/stories/:id` - Delete story
- `POST /api/ai/pricing/generate` - Generate pricing suggestions
- `POST /api/ai/brand/insights` - Generate brand insights
- `POST /api/ai/competition/analyze` - Analyze competition
- `GET /api/ai/insights` - Get AI insights

### Listing Management

- `GET /api/listings` - Get all listings (public)
- `GET /api/listings/:id` - Get single listing (public)
- `POST /api/listings` - Create listing (authenticated)
- `PUT /api/listings/:id` - Update listing (authenticated)
- `DELETE /api/listings/:id` - Delete listing (authenticated)
- `GET /api/listings/my/listings` - Get user's listings (authenticated)

### Artisan Profiles

- `GET /api/artisans` - Get all artisans (public)
- `GET /api/artisans/:id` - Get single artisan (public)
- `GET /api/artisans/:id/listings` - Get artisan's listings (public)
- `GET /api/artisans/:id/skills` - Get artisan's skills (public)
- `GET /api/artisans/:id/stories` - Get artisan's stories (public)

### Social Media

- `GET /api/social/accounts` - Get social accounts (authenticated)
- `GET /api/social/posts` - Get social posts (authenticated)
- `POST /api/social/posts` - Create social post (authenticated)

### Orders & Payments

- `GET /api/orders` - Get orders (authenticated)
- `GET /api/orders/:id` - Get single order (authenticated)
- `PUT /api/orders/:id/status` - Update order status (authenticated)

### Community

- `GET /api/community/posts` - Get community posts (public)
- `POST /api/community/posts` - Create community post (authenticated)
- `GET /api/community/posts/:id` - Get single post (public)
- `POST /api/community/posts/:id/comments` - Add comment (authenticated)
- `POST /api/community/posts/:id/like` - Like post (authenticated)
- `DELETE /api/community/posts/:id/like` - Unlike post (authenticated)

### Analytics

- `GET /api/analytics/dashboard` - Get dashboard data (authenticated)
- `GET /api/analytics/sales` - Get sales analytics (authenticated)
- `GET /api/analytics/social` - Get social media analytics (authenticated)

## 🗄️ Database Schema

The application uses PostgreSQL with Prisma ORM. Key models include:

- **Artisan** - User profiles and business information
- **Listing** - Product listings with images and pricing
- **Order** - Cross-platform order management
- **SocialPost** - Social media content and metrics
- **AIInsight** - AI-generated recommendations and insights
- **CommunityPost** - Community engagement and collaboration
- **TrainingModule** - Educational content and progress tracking

## 🤖 AI Integration

The platform integrates with Google Gemini AI for:

- **Storytelling**: Generate compelling product and brand stories
- **Pricing**: Intelligent pricing suggestions based on market analysis
- **Brand Insights**: Color palettes, typography, and brand guidelines
- **Competition Analysis**: Market positioning and opportunity identification

## 🐳 Docker Services

- **PostgreSQL**: Primary database
- **Redis**: Caching and session storage

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Helmet.js security headers
- Input validation with Joi
- SQL injection protection via Prisma

## 📊 Monitoring & Logging

- Winston logger with file and console outputs
- Request logging with Morgan
- Error tracking and reporting
- Performance monitoring

## 🚀 Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set up production environment**
   - Update `.env` with production values
   - Configure production database
   - Set up Redis instance

3. **Start production server**
   ```bash
   npm start
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please contact the development team or create an issue in the repository.

---

**Built with ❤️ for Indian artisans and craftsmen**
