.PHONY: install setup lint test package deploy
install:
	npm ci
setup: install
lint:
	npm run lint
test:
	npm test
deploy:
	@test -n "$(CALDAV_URL)" -a -n "$(CALDAV_USER)" -a -n "$(CALDAV_PASSWORD)" || (echo 'Set CALDAV_URL, CALDAV_USER and CALDAV_PASSWORD' >&2; exit 1)
	rm -f function.zip
	zip -r function.zip index.js src consultants.json package.json package-lock.json
	yc serverless function version create \
		--function-name booking \
		--runtime nodejs22 \
		--entrypoint index.handler \
		--memory 128m \
		--execution-timeout 10s \
		--source-path function.zip \
		--environment "CALDAV_URL=$(CALDAV_URL),CALDAV_USER=$(CALDAV_USER),CALDAV_PASSWORD=$(CALDAV_PASSWORD)"

package:
	rm -f infra/booking.zip
	zip -r infra/booking.zip index.js src consultants.json package.json package-lock.json
