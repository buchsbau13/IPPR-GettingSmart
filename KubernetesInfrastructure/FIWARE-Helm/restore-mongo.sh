#!/bin/bash
if [ "$#" -ne 2 ]
  then
    echo "Usage: restore-mongo.sh contextname namespace"
    exit 1
fi
kubectl config use-context $1
kubectl cp mongo-dump.tar.bz2 $2/mongo-0:/
#kubectl cp restore-mongo.sh fiware-graziot/mongo-0:/
kubectl exec mongo-0 -n $2 -- apt-get update
kubectl exec mongo-0 -n $2 -- apt-get install bzip2 -y
kubectl exec mongo-0 -n $2 -- tar -xjvf mongo-dump.tar.bz2
#kubectl exec mongo-0 -n fiware-graziot -- chmod u+x /restore-mongo.sh
kubectl exec mongo-0 -n $2 -- mongorestore -d orion-graziot mongo/orion-graziot
kubectl exec mongo-0 -n $2 -- mongorestore -d iotagentul mongo/iotagentul
kubectl exec mongo-0 -n $2 -- mongorestore -d sth_graziot mongo/sth_graziot
