docker-web:
	docker build . -t adamukaapan/shinysorter-frontend-angular:latest

docker-query-server: src/queryserver/**/*
	cd src/queryserver && docker build . -t adamukaapan/shinysorter-query-server:latest

docker-push: docker-web docker-query-server
	docker push adamukaapan/shinysorter-frontend-angular:latest
	docker push adamukaapan/shinysorter-query-server:latest

supagen:
	supabase gen types typescript --local > src/schema.ts
	cp src/schema.ts queryserver/src/schema.ts
