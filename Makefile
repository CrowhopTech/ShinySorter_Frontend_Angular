docker-web:
	docker build . -t adamukaapan/shinysorter-frontend-angular:latest

docker-query-server: src/queryserver/**/*
	cd src/queryserver && docker build . -t adamukaapan/shinysorter-query-server:latest

docker-importer: src/importer/**/*
	cd src/importer && docker build . -t adamukaapan/shinysorter-importer:latest

docker-push-web: docker-web
	docker push adamukaapan/shinysorter-frontend-angular:latest

docker-push-query-server: docker-query-server
	docker push adamukaapan/shinysorter-query-server:latest

docker-push-importer: docker-importer
	docker push adamukaapan/shinysorter-importer:latest

docker-push: docker-push-web docker-push-query-server docker-push-importer

supagen:
	supabase gen types typescript --local > src/schema.ts
	cp src/schema.ts src/queryserver/src/schema.ts
	cp src/schema.ts src/importer/src/schema.ts
