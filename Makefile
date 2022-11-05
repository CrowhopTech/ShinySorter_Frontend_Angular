docker:
	docker build . -t adamukaapan/shinysorter-frontend-angular:latest

docker-push: docker
	docker push adamukaapan/shinysorter-frontend-angular:latest