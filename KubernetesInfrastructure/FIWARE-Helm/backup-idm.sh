#!/bin/bash
if [ -z "$1" ]
  then
    echo "Usage: backup-idm.sh some_file.sql"
    exit 1
fi
kubectl exec -t mysql-0 -n fiware-graziot -- mysqldump --complete-insert --skip-add-locks --skip-add-drop-table --no-create-db --no-create-info --ignore-table=idm.SequelizeMeta  --password=idm idm > $1
