#!/bin/bash
if [ "$#" -ne 3 ]
  then
    echo "Usage: backup-idm.sh contextname namespace some_file.sql"
    exit 1
fi
kubectl config use-context $1
kubectl exec -t mysql-0 -n $2 -- mysqldump --complete-insert --skip-add-locks --skip-add-drop-table --no-create-db --no-create-info --ignore-table=idm.SequelizeMeta  --password=idm idm > $3
