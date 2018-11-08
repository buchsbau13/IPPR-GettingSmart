#!/bin/bash

tar -xjvf mongo-october-2018.tar.bz2
rm mongo-october-2018.tar.bz2
cd mongo
mongorestore --drop -d orion-graziot orion-graziot
mongorestore --drop -d iotagentul iotagentul
mongorestore --drop -d sth_graziot sth_graziot
cd ..
rm -fR mongo
