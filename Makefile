img-repo = registry.home.crowhop.tech:8080/shinysorter
img-tag = latest

docker-web:
	docker build . -t $(img-repo)/shinysorter-frontend-angular:$(img-tag)

docker-query-server: src/queryserver/**/*
	cd src/queryserver && docker build . -t $(img-repo)/shinysorter-query-server:$(img-tag)

docker-importer: src/importer/**/*
	cd src/importer && docker build . -t $(img-repo)/shinysorter-importer:$(img-tag)

docker-push-web: docker-web
	docker push $(img-repo)/shinysorter-frontend-angular:$(img-tag)

docker-push-query-server: docker-query-server
	docker push $(img-repo)/shinysorter-query-server:$(img-tag)

docker-push-importer: docker-importer
	docker push $(img-repo)/shinysorter-importer:$(img-tag)

docker-push: docker-push-web docker-push-query-server docker-push-importer

supagen:
	supabase gen types typescript --local > src/schema.ts
	cp src/schema.ts src/queryserver/src/schema.ts
	cp src/schema.ts src/importer/src/schema.ts
