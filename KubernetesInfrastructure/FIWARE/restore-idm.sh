#!/bin/bash
kubectl exec mysql-0 yum -n fiware-graziot -- install tar -y
kubectl cp ./idm-backup/idm.sql fiware-graziot/mysql-0:/
kubectl exec mysql-0  -n fiware-graziot -- mysql --password=idm --database=idm -e "source /idm.sql;"

#kubectl cp mongo-october-2018.tar.bz2 fiware-graziot/mongo-0:/
#kubectl cp restore-mongo.sh fiware-graziot/mongo-0:/
#kubectl exec mongo-0 -n fiware-graziot -- apt-get update
#kubectl exec mongo-0 -n fiware-graziot -- apt-get install bzip2 -y
#kubectl exec mongo-0 -n fiware-graziot -- chmod u+x /restore-mongo.sh
#kubectl exec mongo-0 -n fiware-graziot -- /restore-mongo.sh
