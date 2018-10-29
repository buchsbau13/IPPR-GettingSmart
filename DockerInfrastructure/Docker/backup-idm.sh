#!/bin/bash
docker exec mysql mysqldump --password=idm --databases idm > idm.sql
docker cp mysql:/idm.sql ./idm-backup/idm.sql
