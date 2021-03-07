default: setup clean fix serve

setup:
	yarn check || yarn
	bundle check || bundle
	make update

fix:
	prettier --write --no-semi "**/*.yml" "**/*.md" "**/*.scss" "assets/**/*.js"
	yarn run stylelint --fix "assets/**/*.scss" || echo 'stylelint: found no scss files to lint'
	bundle exec rubocop -a

clean:
	find . -type d -empty -delete
	find . -type f -empty -delete

update:
	bundle update html2rss-configs
	bin/data-update

serve: setup
	bundle exec jekyll s --drafts --trace

