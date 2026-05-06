# SwiftTriage - AI-Powered IT Service Management Dashboard

[![Next.js](https://img.shields.io/badge/Next.js-14.2.35-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

SwiftTriage is a modern, self-hosted IT Service Management (ITSM) dashboard with AI-powered ticket triage, comprehensive analytics, and customizable widgets. Built for speed, scalability, and ease of deployment.

![SwiftTriage Dashboard](docs/images/dashboard-preview.png)

## ✨ Key Features

### 🎯 AI-Powered Ticket Triage
- **Automatic Categorization**: AI analyzes ticket descriptions and assigns categories (Hardware, Network, Access, Software)
- **Urgency Scoring**: Intelligent urgency assessment (1-5 scale)
- **Smart Summaries**: One-sentence AI-generated summaries for quick review
- **Powered by Groq**: Lightning-fast inference using llama-3.3-70b-versatile model

### 📊 Enterprise Dashboard
- **10 Widget Types**: Status, Priority, Category, Tech Group, Alert Level, Request Type, Activity Feed, Alert Condition, Customer Satisfaction, Trends
- **Drag-and-Drop**: Customize dashboard layout with intuitive drag-and-drop
- **Real-time Updates**: Auto-refresh with configurable polling intervals
- **Interactive Charts**: Click-through navigation from charts to filtered views
- **Widget Configuration**: Edit titles, filters, date ranges, and display options

### 👥 Customer Management
- **Customer Profiles**: Comprehensive customer information with CDI ratings
- **Relationship Tracking**: Link customers to tickets, products, and activities
- **Activity Timeline**: Track all customer interactions (calls, emails, meetings, notes)
- **SLA Management**: Monitor and enforce service level agreements

### 🔐 Role-Based Access Control
- **End Users**: Submit tickets, view own tickets, track status
- **IT Staff**: Full dashboard access, customer management, reporting, admin functions
- **Secure Authentication**: NextAuth.js with JWT tokens

### 📈 Analytics & Reporting
- **Ticket Statistics**: Group by status, priority, category, tech group, alert level
- **Trend Analysis**: Multi-line charts showing ticket volume over time
- **Customer Satisfaction**: CDI (Customer Dissatisfaction Index) tracking
- **CSV Export**: Download widget data for external analysis

## 🚀 Quick Start

### Prerequisites

- **Node.js**: 18.0.0 or higher
- **npm**: 9.0.0 or higher
- **Neon Database**: Serverless PostgreSQL account ([sign up free](https://neon.tech))
- **Groq API Key**: AI inference API key ([get free key](https://console.groq.com))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/swifttriage.git
   cd swifttriage
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.local.example .env.local
   ```

   Edit `.env.local` with your credentials:
   ```env
   # Database (Neon PostgreSQL)
   DATABASE_URL=postgresql://user:password@host.neon.tech/swifttriage?sslmode=require

   # Authentication
   NEXTAUTH_SECRET=your-secret-key-min-32-chars
   NEXTAUTH_URL=http://localhost:3000

   # AI Service (Groq)
   GROQ_API_KEY=your-groq-api-key
   ```

   Generate a secure secret:
   ```bash
   openssl rand -base64 32
   ```

4. **Set up the database**
   ```bash
   npm run db:generate
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   ```
   http://localhost:3000
   ```

## 📖 Documentation

- **[Installation Guide](docs/INSTALLATION.md)** - Detailed setup instructions
- **[User Guide](docs/USER_GUIDE.md)** - End user documentation
- **[Admin Guide](docs/ADMIN_GUIDE.md)** - IT staff and administrator guide
- **[API Documentation](docs/API.md)** - REST API reference
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Production deployment instructions
- **[Troubleshooting](docs/TROUBLESHOOTING.md)** - Common issues and solutions

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Charts**: Recharts
- **Icons**: Lucide React
- **Drag-and-Drop**: @dnd-kit

### Backend
- **API**: Vercel Serverless Route Handlers
- **Database**: Neon (Serverless PostgreSQL)
- **ORM**: Drizzle ORM
- **Authentication**: NextAuth.js
- **AI**: Groq API (llama-3.3-70b-versatile)

### Data Fetching
- **Client State**: SWR (stale-while-revalidate)
- **Validation**: Zod schemas

## 🎨 Widget System

SwiftTriage features a powerful widget system with 10 pre-built widget types:

1. **Tickets by Status** - Pie chart showing open, closed, resolved, etc.
2. **Tickets by Priority** - Color-coded priority distribution
3. **Tickets by Category** - Donut chart with category breakdown
4. **Tickets by Tech Group** - Workload distribution across teams
5. **Tickets by Alert Level** - SLA alert monitoring
6. **Tickets by Request Type** - Horizontal bar chart of request types
7. **Ticket Activity Feed** - Real-time activity stream
8. **Tickets by Alert Condition** - SLA breach tracking
9. **Customer Satisfaction** - CDI rating with trend indicator
10. **Ticket Trends** - Multi-line chart showing volume over time

### Widget Features
- ✅ Drag-and-drop reordering
- ✅ Custom filters (date range, limit, sort order)
- ✅ Dynamic resizing (1-3 columns)
- ✅ CSV export
- ✅ Click-through navigation
- ✅ Auto-refresh polling

## 🔧 Configuration

### Environment Variables

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string | - |
| `NEXTAUTH_SECRET` | Yes | NextAuth.js secret (32+ chars) | - |
| `NEXTAUTH_URL` | Yes | Application URL | `http://localhost:3000` |
| `GROQ_API_KEY` | Yes | Groq API key for AI inference | - |
| `POLLING_INTERVAL` | No | SWR polling interval (ms) | `5000` |

### Database Schema

The application uses 7 main tables:
- `tickets` - Support tickets with AI triage data
- `customers` - Customer profiles and CDI ratings
- `products` - Product catalog
- `customer_products` - Customer-product relationships
- `activities` - Activity tracking (calls, emails, meetings)
- `sla_policies` - SLA definitions and policies
- `widget_configs` - User dashboard configurations

## 🧪 Testing

### Run Tests
```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build test
npm run build
```

### Manual Testing
See [Widget System Testing Guide](aidlc-docs/widget-system-testing-guide.md) for comprehensive testing scenarios.

## 📦 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your repository
   - Configure environment variables
   - Deploy

3. **Configure Domain**
   - Add custom domain in Vercel dashboard
   - Update `NEXTAUTH_URL` environment variable

### Other Platforms

SwiftTriage can be deployed to any platform supporting Next.js:
- **Netlify**: Use Next.js plugin
- **Railway**: One-click deploy
- **DigitalOcean App Platform**: Docker or buildpack
- **AWS Amplify**: Next.js SSR support

See [Deployment Guide](docs/DEPLOYMENT.md) for detailed instructions.

## 🔒 Security

- ✅ **Authentication**: Secure session management with NextAuth.js
- ✅ **Authorization**: Role-based access control (RBAC)
- ✅ **SQL Injection**: Parameterized queries via Drizzle ORM
- ✅ **XSS Protection**: React automatic escaping
- ✅ **CSRF Protection**: NextAuth.js built-in protection
- ✅ **Environment Variables**: Secrets never exposed to client
- ✅ **HTTPS**: SSL/TLS encryption (production)

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js** - React framework
- **Vercel** - Hosting and serverless functions
- **Neon** - Serverless PostgreSQL
- **Groq** - Lightning-fast AI inference
- **Recharts** - Chart library
- **@dnd-kit** - Drag-and-drop library

## 📞 Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/yourusername/swifttriage/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/swifttriage/discussions)
- **Email**: support@swifttriage.com

## 🗺️ Roadmap

### v1.1 (Q2 2026)
- [ ] WebSocket integration for real-time updates
- [ ] Advanced filtering and search
- [ ] Custom report builder
- [ ] Bulk operations for tickets

### v1.2 (Q3 2026)
- [ ] Email notifications
- [ ] File attachment support
- [ ] Mobile-responsive improvements
- [ ] Progressive Web App (PWA)

### v2.0 (Q4 2026)
- [ ] Multi-tenant support
- [ ] Advanced analytics dashboard
- [ ] Integration marketplace
- [ ] Native mobile apps

## 📊 Project Status

- ✅ **Core Features**: Complete
- ✅ **Widget System**: Complete (10 widgets)
- ✅ **Customer Management**: Complete
- ✅ **Authentication**: Complete
- ✅ **AI Triage**: Complete
- ⏳ **Email Notifications**: Planned
- ⏳ **File Uploads**: Planned
- ⏳ **Advanced Reports**: Planned

---

**Built with ❤️ by the SwiftTriage Team**

**Version**: 1.0.0  
**Last Updated**: May 5, 2026
