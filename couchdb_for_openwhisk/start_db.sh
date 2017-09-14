#!/bin/bash

if [ ! -f //usr/local/var/lib/couchdb/couchdb.initialized ]; then
    /init_openwhisk_db.sh
fi

tini -s -- couchdb