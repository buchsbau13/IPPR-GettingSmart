#!/bin/bash
kubectl cp mongo-dump.tar.bz2 fiware-graziot/mongo-0:/
kubectl cp restore-mongo.sh fiware-graziot/mongo-0:/
kubectl exec mongo-0 -n fiware-graziot -- apt-get update
kubectl exec mongo-0 -n fiware-graziot -- apt-get install bzip2 -y
kubectl exec mongo-0 -n fiware-graziot -- chmod u+x /restore-mongo.sh
kubectl exec mongo-0 -n fiware-graziot -- /restore-mongo.sh
