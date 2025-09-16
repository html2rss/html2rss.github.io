default: setup clean lintfix serve

setup:
	npm ci
	bundle check || bundle
	make update

lint:
	npm run lint
	make lint-ruby

lintfix:
	npm run lintfix
	make lintfix-ruby

lint-ruby:
	bundle exec rubocop

lintfix-ruby:
	bundle exec rubocop -a

clean:
	find . -type d -empty -delete
	find . -type f -empty -delete

update:
	bundle update html2rss-configs
	bin/data-update

serve: setup
	bundle exec jekyll s --drafts --trace
