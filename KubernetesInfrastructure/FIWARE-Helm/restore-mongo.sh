#!/bin/bash
kubectl cp mongo-dump.tar.bz2 fiware-graziot/mongo-0:/
#kubectl cp restore-mongo.sh fiware-graziot/mongo-0:/
kubectl exec mongo-0 -n fiware-graziot -- apt-get update
kubectl exec mongo-0 -n fiware-graziot -- apt-get install bzip2 -y
kubectl exec mongo-0 -n fiware-graziot -- tar -xjvf mongo-dump.tar.bz2
#kubectl exec mongo-0 -n fiware-graziot -- chmod u+x /restore-mongo.sh
kubectl exec mongo-0 -n fiware-graziot -- mongorestore -d orion-graziot mongo/orion-graziot
kubectl exec mongo-0 -n fiware-graziot -- mongorestore -d iotagentul mongo/iotagentul
kubectl exec mongo-0 -n fiware-graziot -- mongorestore -d sth_graziot mongo/sth_graziot
