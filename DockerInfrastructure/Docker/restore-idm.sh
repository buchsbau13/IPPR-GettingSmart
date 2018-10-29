#!/bin/bash

docker cp ./idm-backup/idm.sql mysql:/idm.sql
docker exec -i mysql mysql --password=idm < idm.sql
