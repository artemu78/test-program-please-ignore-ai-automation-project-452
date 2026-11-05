install:
	npm install

setup:
	npm install

lint:
	npm run lint

deploy:
	rm -f function.zip
	zip -r function.zip index.js package.json package-lock.json
	yc serverless function version create \
		--function-name booking \
		--runtime nodejs22 \
		--entrypoint index.handler \
		--memory 128m \
		--execution-timeout 10s \
		--source-path function.zip