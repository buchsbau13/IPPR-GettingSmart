#!/bin/bash
if [ "$#" -ne 1 ]
  then
    echo "Usage: restore-mongo.sh namspace"
    exit 1
fi
kubectl cp mongo-dump.tar.bz2 $1/mongo-0:/
#kubectl cp restore-mongo.sh fiware-graziot/mongo-0:/
kubectl exec mongo-0 -n $1 -- apt-get update
kubectl exec mongo-0 -n $1 -- apt-get install bzip2 -y
kubectl exec mongo-0 -n $1 -- tar -xjvf mongo-dump.tar.bz2
#kubectl exec mongo-0 -n fiware-graziot -- chmod u+x /restore-mongo.sh
kubectl exec mongo-0 -n $1 -- mongorestore -d orion-graziot mongo/orion-graziot
kubectl exec mongo-0 -n $1 -- mongorestore -d iotagentul mongo/iotagentul
kubectl exec mongo-0 -n $1 -- mongorestore -d sth_graziot mongo/sth_graziot
