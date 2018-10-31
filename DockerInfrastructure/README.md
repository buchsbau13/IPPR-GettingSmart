# Installation

All Docker related files are in the `Docker`folder.
Before you can start the docker-compose file you need to create a file called `.env`
in the `Docker`folder. This file needs one entry flie follows:

```
IDM_HOST=10.0.0.1
```

Where the IP adress needs to be replaced with your local IP.

Now from within the `Docker` folder you can run the following command:

`docker-compose up`

This will download the required images and create the containers. At this time, however, important configuration entries necessary for the communication between
PEP proxies, Idm and WireCloud are still missing. We can easily restore these
settings by executing this command from within the `Docker` folder:

`docker exec mysql mysql --password=idm < ./idm-backup/idm.sql`

Besides this, there's also a dump of the MongoDB (containing entity and device definitions) in folder `mongo-dump`.
If you have a local mongo installation you can restore these to dumps with the following commands run whitin the `mongo-dump` folder:

```
mongorestore -d orion-graziot --drop orion-graziot
mongorestore -d sth_graziot --drop sth_graziot
```

Now you need to restart all containers by executing:

```
docker-compose down
docker-compose up
```
