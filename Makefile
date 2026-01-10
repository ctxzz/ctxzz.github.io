.PHONY : update
update :
	hugo mod get -u ./...
	hugo mod tidy

.PHONY : server
server :
	hugo mod clean
	hugo server

.PHONY : run
run : update server