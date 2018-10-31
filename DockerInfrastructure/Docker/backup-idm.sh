#!/bin/bash
docker exec mysql mysqldump --password=idm --databases idm > ./idm-backup/idm.sql
