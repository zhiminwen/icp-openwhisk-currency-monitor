#!/bin/bash

if [ ! -f /usr/local/var/lib/couchdb/couchdb.initialized ]; then
    /init_openwhisk_db.sh
else
    couchdb -b
    sleep 30
    
    curl -X PUT http://$DB_HOST:$DB_PORT/_config/admins/$DB_USERNAME -d "\"$DB_PASSWORD\""
    curl -X PUT http://$DB_USERNAME:$DB_PASSWORD@$DB_HOST:$DB_PORT/_config/query-server_config/reduce_limit -d '"false"'
    couchdb -d
fi

tini -s -- couchdb


