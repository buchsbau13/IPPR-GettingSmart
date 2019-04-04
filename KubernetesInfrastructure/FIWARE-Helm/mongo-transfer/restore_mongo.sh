if [ "$#" -ne 3 ]
  then
    echo "Usage: dump_orion.sh clustername database_name dump_file_name"
    exit 1
fi
NAMESPACE=fiware-graziot
POD=mongo-0
kubectl config use-context $1
kubectl cp $3 $POD:/  -n $NAMESPACE
kubectl exec -n $NAMESPACE $POD -- tar -xzvf $(basename $3)
kubectl exec -n $NAMESPACE $POD -- mongorestore --drop -d $2 $2
kubectl exec -n $NAMESPACE $POD -- rm -fR $2
kubectl exec -n $NAMESPACE $POD -- rm $(basename $3)
