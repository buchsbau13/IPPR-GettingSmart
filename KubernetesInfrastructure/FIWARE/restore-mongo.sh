#!/bin/bash

tar -xjvf mongo-dump.tar.bz2
rm mongo-dump.tar.bz2
cd mongo
mongorestore --drop -d orion-graziot orion-graziot
mongorestore --drop -d iotagentul iotagentul
mongorestore --drop -d sth_graziot sth_graziot
cd ..
rm -fR mongo
