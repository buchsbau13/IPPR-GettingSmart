#!/bin/bash
if [ -z "$1" ]
  then
    echo "Usage: restore-idm.sh  some_file.sql"
    exit 1
fi
kubectl exec mysql-0 yum -n fiware-graziot -- install tar -y
kubectl cp $1 fiware-graziot/mysql-0:/idm.sql
kubectl exec mysql-0  -n fiware-graziot -- mysql --password=idm --database=idm -e "source /idm.sql;"
