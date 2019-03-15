# Initialise the Config Server Replica Set and each Shard Replica Set
NAMESPACE=mongo
NAME=mongo-shard
CMD="rs.initiate({_id: \"crs\", configsvr: true, members: [ {_id: 0, host: \"$NAME-config-0.$NAME-config-svc.$NAMESPACE.svc.cluster.local:27017\"}, {_id: 1, host: \"$NAME-config-1.$NAME-config-svc.$NAMESPACE.svc.cluster.local:27017\"}, {_id: 2, host: \"$NAME-config-2.$NAME-config-svc.$NAMESPACE.svc.cluster.local:27017\"} ]});"
kubectl exec $NAME-config-0 -n $NAMESPACE -- mongo --eval "$CMD"
kubectl exec $NAME-shard1-0 -n $NAMESPACE -- mongo --eval "rs.initiate({_id: \"shard1\", members: [ {_id: 0, host: \"$NAME-shard1-0.$NAME-shard1-svc.$NAMESPACE.svc.cluster.local:27017\"}, {_id: 1, host: \"$NAME-shard1-1.$NAME-shard1-svc.$NAMESPACE.svc.cluster.local:27017\"}, {_id: 2, host: \"$NAME-shard1-2.$NAME-shard1-svc.$NAMESPACE.svc.cluster.local:27017\"} ]});"
kubectl exec $NAME-shard2-0 -n $NAMESPACE -- mongo --eval "rs.initiate({_id: \"shard2\", members: [ {_id: 0, host: \"$NAME-shard2-0.$NAME-shard2-svc.$NAMESPACE.svc.cluster.local:27017\"}, {_id: 1, host: \"$NAME-shard2-1.$NAME-shard2-svc.$NAMESPACE.svc.cluster.local:27017\"}, {_id: 2, host: \"$NAME-shard2-2.$NAME-shard2-svc.$NAMESPACE.svc.cluster.local:27017\"} ]});"
kubectl exec $NAME-shard3-0 -n $NAMESPACE -- mongo --eval "rs.initiate({_id: \"shard3\", members: [ {_id: 0, host: \"$NAME-shard3-0.$NAME-shard3-svc.$NAMESPACE.svc.cluster.local:27017\"}, {_id: 1, host: \"$NAME-shard3-1.$NAME-shard3-svc.$NAMESPACE.svc.cluster.local:27017\"}, {_id: 2, host: \"$NAME-shard3-2.$NAME-shard3-svc.$NAMESPACE.svc.cluster.local:27017\"} ]});"

# Chech if each MongoDB Shard's Replica Set + the ConfigDB Replica Set is ready
kubectl exec $NAME-config-0 -n $NAMESPACE -- mongo --quiet --eval 'if (rs.status().hasOwnProperty("myState") && rs.status().myState == 1) { print("mongo-config ok")} else {{ print("mongo-config not ok")}};'
kubectl exec $NAME-shard1-0 -n $NAMESPACE -- mongo --quiet --eval 'if (rs.status().hasOwnProperty("myState") && rs.status().myState == 1) { print("mongo-shard1 ok")} else {{ print("mongo-shard1 not ok")}};'
kubectl exec $NAME-shard2-0 -n $NAMESPACE -- mongo --quiet --eval 'if (rs.status().hasOwnProperty("myState") && rs.status().myState == 1) { print("mongo-shard2 ok")} else {{ print("mongo-shard2 not ok")}};'
kubectl exec $NAME-shard3-0 -n $NAMESPACE -- mongo --quiet --eval 'if (rs.status().hasOwnProperty("myState") && rs.status().myState == 1) { print("mongo-shard3 ok")} else {{ print("mongo-shard3 not ok")}};'


# Check if the mongos have started properly
kubectl --v=0 exec $NAME-router-0 -n $NAMESPACE -- mongo --quiet --eval 'db.getMongo()';
kubectl --v=0 exec $NAME-router-1 -n $NAMESPACE -- mongo --quiet --eval 'db.getMongo()';

# Add Shards to the Configdb
kubectl exec $NAME-router-0 -n $NAMESPACE -- mongo --eval "sh.addShard(\"shard1/$NAME-shard1-0.$NAME-shard1-svc.$NAMESPACE.svc.cluster.local:27017\");"
kubectl exec $NAME-router-0 -n $NAMESPACE -- mongo --eval "sh.addShard(\"shard2/$NAME-shard2-0.$NAME-shard2-svc.$NAMESPACE.svc.cluster.local:27017\");"
kubectl exec $NAME-router-0 -n $NAMESPACE -- mongo --eval "sh.addShard(\"shard3/$NAME-shard3-0.$NAME-shard3-svc.$NAMESPACE.svc.cluster.local:27017\");"

# Create the Admin User
kubectl exec $NAME-router-0 -n $NAMESPACE -- mongo --eval 'db.getSiblingDB("admin").createUser({user:"dbadmin",pwd:"admin",roles:[{role:"root",db:"admin"}]});'

# Check cluster status
#kubectl exec -it $NAME-router-0 -n $NAMESPACE bash
#$ mongo
#> db.getSiblingDB('admin').auth("dbadmin", "admin");
#> sh.status();
