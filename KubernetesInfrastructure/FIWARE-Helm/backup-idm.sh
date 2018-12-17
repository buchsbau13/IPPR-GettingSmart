#!/bin/bash
kubectl exec -t mysql-0 -n fiware-graziot -- mysqldump --password=idm idm > ./idm-backup/idm.sql
