# html2rss Documentation

The official documentation website for html2rss, built with Astro Starlight for modern performance and developer experience.

## 🚀 Features

- **Modern Documentation**: Built with Astro Starlight for better performance and developer experience
- **Interactive Feed Directory**: Fully functional with search, filtering, and parameter configuration
- **Progressive Enhancement**: Works without JavaScript, enhanced with Alpine.js
- **Dark Theme**: Integrated with Starlight's theme system
- **GitHub Integration**: Edit links and social links
- **Analytics**: GoatCounter integration
- **SEO Optimized**: Meta tags, sitemap, and search indexing

## 📁 Project Structure

```
html2rss.github.io/
├── src/
│   ├── content/docs/          # Documentation content (MDX)
│   ├── components/            # Astro components
│   │   └── FeedDirectory.astro # Interactive feed directory
│   ├── data/                  # Data files
│   │   ├── configs.json       # Generated feed configurations
│   │   └── loadConfigs.ts     # Data loader
│   └── assets/                # Static assets
├── bin/
│   └── data-update            # Script to update feed data
├── public/                    # Public assets
├── .github/workflows/         # CI/CD workflows
└── Gemfile                    # Ruby dependencies for data updates
```

## 🛠️ Development

### Prerequisites

- Node.js 22+
- Ruby 3.3+
- npm/yarn

### Setup

1. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

2. **Install Ruby dependencies:**
   ```bash
   bundle install
   ```

3. **Update feed data:**
   ```bash
   npm run update-data
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run update-data` - Update feed configurations from html2rss-configs
- `npm run build:full` - Update data and build

## 📊 Data Management

The feed directory data is automatically generated from the `html2rss-configs` gem:

1. **Source**: `html2rss-configs` gem (latest commit from GitHub)
2. **Generation**: `bin/data-update` script processes the gem's configs
3. **Output**: `src/data/configs.json` (clean JSON format)
4. **Usage**: Loaded by `src/data/loadConfigs.ts` in the FeedDirectory component

### Data Update Process

The `bin/data-update` script:
- Fetches all config files from the `html2rss-configs` gem
- Extracts metadata (domain, name, parameters, etc.)
- Converts to clean JSON format (no parsing issues)
- Generates `src/data/configs.json`

## 🚀 Deployment

### GitHub Pages (CI/CD)

The site is automatically deployed via GitHub Actions:

1. **Trigger**: Push to `main` branch
2. **Process**:
   - Install Ruby dependencies
   - Run `bin/data-update` to update feed data
   - Install Node.js dependencies
   - Build Astro site
   - Deploy to GitHub Pages

### Manual Deployment

```bash
# Update data and build
npm run build:full

# Deploy the dist/ folder to your hosting provider
```

## 🔧 Configuration

### Astro Configuration

Key settings in `astro.config.mjs`:
- Site URL and base path
- Starlight integration with custom head elements
- GitHub social links and edit URLs
- Sidebar navigation structure

### Feed Directory

The interactive Feed Directory (`src/components/FeedDirectory.astro`):
- Uses Alpine.js for interactivity
- Loads data from `src/data/configs.yml`
- Provides search and filtering
- Shows parameter forms for dynamic feeds
- Generates RSS URLs and GitHub edit links

## 📝 Content Migration

All content has been migrated from Jekyll to Astro Starlight:

- **Markdown → MDX**: Converted all `.md` files to `.mdx`
- **Frontmatter**: Updated to Starlight format
- **URLs**: Updated relative links
- **Images**: Migrated to `public/assets/images/`
- **Components**: Recreated Jekyll components as Astro components

## 🎨 Styling

- **Theme**: Uses Starlight's built-in theme system
- **Colors**: HSL color variables for dark/light mode compatibility
- **Components**: Custom CSS for Feed Directory integrated with Starlight
- **Responsive**: Mobile-friendly design

## 🔍 Search

- **Engine**: Pagefind (integrated with Starlight)
- **Indexing**: Automatic during build
- **Features**: Full-text search across all documentation

## 📈 Analytics

- **Provider**: GoatCounter
- **Integration**: Script added to `astro.config.mjs`
- **Privacy**: No cookies, GDPR compliant

## 🐛 Troubleshooting

### Common Issues

1. **Data not loading**: Run `npm run update-data` to regenerate configs
2. **Build errors**: Check for JSON syntax issues in generated data
3. **Styling issues**: Ensure CSS uses Starlight's color variables

### Development Tips

- Use `npm run build:full` to test the complete build process
- Check `src/data/configs.json` for data issues
- Use browser dev tools to debug Alpine.js components

## 📚 Migration Notes

This migration preserves all functionality from the original Jekyll site:

- ✅ All content migrated
- ✅ Feed Directory fully functional
- ✅ Search and navigation working
- ✅ GitHub integration maintained
- ✅ Analytics preserved
- ✅ SEO optimization maintained
- ✅ Progressive enhancement working
- ✅ Dark theme support

The new Astro Starlight version provides better performance, modern tooling, and improved developer experience while maintaining full backward compatibility.
