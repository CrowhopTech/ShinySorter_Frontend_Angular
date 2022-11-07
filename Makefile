docker:
	docker build . -t adamukaapan/shinysorter-frontend-angular:latest

docker-push: docker
	docker push adamukaapan/shinysorter-frontend-angular:latest

swagger-client:
	docker run --rm -v ${PWD}:/local -v ${PWD}/../backend/pkg/swagger/swagger.yaml:/swagger.yaml swaggerapi/swagger-codegen-cli generate \
	-i /swagger.yaml \
	-l typescript-angular --additional-properties ngVersion=14 \
    -o /local/angular-client
	sudo chown -R adamukaapan:adamukaapan angular-client