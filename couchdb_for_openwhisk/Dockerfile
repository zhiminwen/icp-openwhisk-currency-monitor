FROM couchdb:1.6.1
ADD init_openwhisk_db.sh /init_openwhisk_db.sh
ADD image_init.sh /image_init.sh
ADD start_db.sh /start_db.sh

RUN apt-get update -y && \
	apt-get install -y git curl sudo python-dev libffi-dev libssl-dev && \
	chmod +x /image_init.sh /init_openwhisk_db.sh /start_db.sh && \
	/image_init.sh && \
	apt-get clean

CMD ["/start_db.sh"]
