default: setup clean lintfix dev

setup:
	npm ci
	bundle check || bundle
	make update

dev:
	npm run dev

build:
	npm run build

preview:
	npm run preview

build-full:
	npm run build:full

lint:
	npm run lint

lintfix:
	npm run lintfix

clean:
	find . -type d -empty -delete
	find . -type f -empty -delete

update:
	bundle update html2rss-configs
	bin/data-update
