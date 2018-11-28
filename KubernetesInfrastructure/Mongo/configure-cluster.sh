# Initialise the Config Server Replica Set and each Shard Replica Set
kubectl exec mongo-config-0 -n mongo -- mongo --eval "rs.initiate({_id: \"crs\", configsvr: true, members: [ {_id: 0, host: \"mongo-config-0.mongo-config-svc.mongo.svc.cluster.local:27017\"}, {_id: 1, host: \"mongo-config-1.mongo-config-svc.mongo.svc.cluster.local:27017\"}, {_id: 2, host: \"mongo-config-2.mongo-config-svc.mongo.svc.cluster.local:27017\"} ]});"
kubectl exec mongo-shard1-0 -n mongo -- mongo --eval "rs.initiate({_id: \"shard1\", members: [ {_id: 0, host: \"mongo-shard1-0.mongo-shard1-svc.mongo.svc.cluster.local:27017\"}, {_id: 1, host: \"mongo-shard1-1.mongo-shard1-svc.mongo.svc.cluster.local:27017\"}, {_id: 2, host: \"mongo-shard1-2.mongo-shard1-svc.mongo.svc.cluster.local:27017\"} ]});"
kubectl exec mongo-shard2-0 -n mongo -- mongo --eval "rs.initiate({_id: \"shard2\", members: [ {_id: 0, host: \"mongo-shard2-0.mongo-shard2-svc.mongo.svc.cluster.local:27017\"}, {_id: 1, host: \"mongo-shard2-1.mongo-shard2-svc.mongo.svc.cluster.local:27017\"}, {_id: 2, host: \"mongo-shard2-2.mongo-shard2-svc.mongo.svc.cluster.local:27017\"} ]});"

# Chech if each MongoDB Shard's Replica Set + the ConfigDB Replica Set is ready
kubectl exec mongo-config-0 -n mongo -- mongo --quiet --eval 'if (rs.status().hasOwnProperty("myState") && rs.status().myState == 1) { print("mongo-config ok")} else {{ print("mongo-config not ok")}};'
kubectl exec mongo-shard1-0 -n mongo -- mongo --quiet --eval 'if (rs.status().hasOwnProperty("myState") && rs.status().myState == 1) { print("mongo-shard1 ok")} else {{ print("mongo-shard1 not ok")}};'
kubectl exec mongo-shard2-0 -n mongo -- mongo --quiet --eval 'if (rs.status().hasOwnProperty("myState") && rs.status().myState == 1) { print("mongo-shard2 ok")} else {{ print("mongo-shard2 not ok")}};'

# Check if the mongos have started properly
kubectl --v=0 exec mongo-router-0 -n mongo -- mongo --quiet --eval 'db.getMongo()';
kubectl --v=0 exec mongo-router-1 -n mongo -- mongo --quiet --eval 'db.getMongo()';

# Add Shards to the Configdb
kubectl exec mongo-router-0 -n mongo -- mongo --eval 'sh.addShard("shard1/mongo-shard1-0.mongo-shard1-svc.mongo.svc.cluster.local:27017");'
kubectl exec mongo-router-0 -n mongo -- mongo --eval 'sh.addShard("shard2/mongo-shard2-0.mongo-shard2-svc.mongo.svc.cluster.local:27017");'

# Create the Admin User
kubectl exec mongo-router-0 -n mongo -- mongo --eval 'db.getSiblingDB("admin").createUser({user:"dbadmin",pwd:"admin",roles:[{role:"root",db:"admin"}]});'

# Check cluster status
kubectl exec -it mongo-router-0 -n mongo bash
$ mongo
> db.getSiblingDB('admin').auth("dbadmin", "admin");
> sh.status();

# Enable Sharding
> sh.enableSharding("<database>") (e.g. sh.enableSharding("sth_graziot"))

# if collection already contains data, you must create an index on the shard key
> db.<collection>.createIndex({"key": "value"}) (e.g. db.sth_x002fxffffSensor1xffffstatic.createIndex({"_id": 1}))

# shard collection using ranged sharding strategy
> sh.shardCollection("<database>.<collection>", { <shard key> : <direction> } ) (e.g. sh.shardCollection("sth_graziot.sth_x002fxffffSensor1xffffstatic", { "_id" : 1 }))