#!/bin/bash
if [ "$#" -ne 3 ]
  then
    echo "Usage: restore-idm.sh context_name namspace some_file.sql"
    exit 1
fi
NAMESPACE=$2
kubectl config use-context $1
kubectl exec mysql-0 -n $NAMESPACE -- mysql -u root --password=idm -e 'drop database idm;'
kubectl exec mysql-0 -n $NAMESPACE -- mysql -u root --password=idm -e 'create database idm;'
KEYROCK=$(kubectl get pod -l run=keyrock -n $NAMESPACE -o go-template --template '{{range .items}}{{.metadata.name}}{{end}}')
kubectl exec $KEYROCK -n $NAMESPACE -- npm run migrate_db
kubectl exec mysql-0 yum -n $NAMESPACE -- install tar -y
kubectl cp $3 $NAMESPACE/mysql-0:/idm.sql
kubectl exec mysql-0  -n $NAMESPACE -- mysql --password=idm --database=idm -e "source /idm.sql;"
