if [ "$#" -ne 2 ]
  then
    echo "Usage: dump_orion.sh clustername database"
    exit 1
fi
NAMESPACE=mongo4
POD=mongo4-0
kubectl config use-context $1
kubectl exec -n $NAMESPACE $POD -- rm -fR dump
kubectl exec -n $NAMESPACE $POD -- mongodump -d $2
kubectl exec -n $NAMESPACE $POD -- tar -czvf $2.tar.tz --directory=dump $2
kubectl exec -n $NAMESPACE $POD -- rm -fR dump
kubectl cp $POD:$2.tar.tz ./$2-$(date +%Y-%m-%d).tar.tz -n $NAMESPACE
kubectl exec -n $NAMESPACE $POD -- rm $2.tar.tz
