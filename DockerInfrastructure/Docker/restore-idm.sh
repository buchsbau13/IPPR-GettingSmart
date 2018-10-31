#!/bin/bash

docker exec mysql mysql --password=idm < ./idm-backup/idm.sql
