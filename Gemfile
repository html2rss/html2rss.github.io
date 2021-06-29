# frozen_string_literal: true

source 'https://rubygems.org'

gem 'jekyll', '~> 4.2.0'
gem 'just-the-docs'

gem 'countries'

gem 'html2rss', git: 'https://github.com/html2rss/html2rss.git'
gem 'html2rss-configs', git: 'https://github.com/html2rss/html2rss-configs.git'

group :jekyll_plugins do
  gem 'jekyll-feed', '~> 0.15'
  gem 'jekyll-loading-lazy'
  gem 'jekyll-sitemap'
  gem 'jekyll-target-blank'
end

# Windows and JRuby does not include zoneinfo files, so bundle the tzinfo-data gem
# and associated library.
platforms :mingw, :x64_mingw, :mswin, :jruby do
  gem 'tzinfo', '~> 2.0'
  gem 'tzinfo-data'
end

# Performance-booster for watching directories on Windows
gem 'wdm', '~> 0.1.1', platforms: %i[mingw x64_mingw mswin]

group :development do
  gem 'rubocop', '~> 1.18'
end
