if [ "$#" -ne 2 ]
  then
    echo "Usage: createIndizes.sh clustername namespace"
    exit 1
fi
NAMESPACE=$2
kubectl config use-context $1
SCRIPT="db.getCollectionNames().forEach(c => { db.getCollection(c).createIndex({ 'recvTime':1},{'background': true});db.getCollection(c).createIndex({ 'attrName':1, 'recvTime':-1},{'background': true});});"
ROUTER_POD=$(kubectl get pod -l app=mongo-shard-router -n $NAMESPACE -o go-template --template '{{(index .items 0).metadata.name}}')
echo "Mongo Router: $ROUTER_POD"
kubectl exec -n $NAMESPACE $ROUTER_POD -- mongo -u fiware -p graziot sth_graziot --eval "$SCRIPT"
