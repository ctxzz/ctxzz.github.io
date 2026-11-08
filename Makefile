.PHONY : install
install :
	npm ci

.PHONY : update
update :
	hugo mod get -u ./...
	hugo mod tidy

.PHONY : server
server :
	hugo server

.PHONY : clean
clean :
	hugo mod clean

.PHONY : run
run : update server
