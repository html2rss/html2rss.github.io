default: setup lint dev

setup:
	npm ci

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
