#!/bin/bash
kubectl exec -t mysql-0 -n fiware-graziot -- mysqldump --complete-insert --skip-add-locks --skip-add-drop-table --no-create-db --no-create-info --ignore-table=idm.SequelizeMeta  --password=idm idm > ./idm-backup/idm.sql
