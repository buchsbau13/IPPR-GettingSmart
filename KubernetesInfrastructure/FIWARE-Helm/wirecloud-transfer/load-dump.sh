if [ "$#" -ne 3 ]
  then
    echo "Usage: load-dump.sh clustername namespace dump_file_name"
    exit 1
fi
NAMESPACE=$2
kubectl config use-context $1
WIRECLOUD_POD=$(kubectl get pod -l run=wirecloud -n $NAMESPACE -o go-template --template '{{range .items}}{{.metadata.name}}{{end}}')
echo "Wircloud pod: $WIRECLOUD_POD"
echo "Deleting all existing data"
D_FILE=$(basename $3)
kubectl exec $WIRECLOUD_POD -n $NAMESPACE -c wirecloud -- ./manage.py flush --noinput
echo "Copying $D_FILE to $WIRECLOUD_POD:"
kubectl cp $3 $WIRECLOUD_POD:/opt/wirecloud_instance/ -n $NAMESPACE -c wirecloud
echo "Restoring $D_FILE using manage.py loaddata"
kubectl exec $WIRECLOUD_POD -n $NAMESPACE -c wirecloud -- ./manage.py loaddata $D_FILE
echo "Deleting $D_FILE from $WIRECLOUD_POD"
kubectl exec $WIRECLOUD_POD -n $NAMESPACE  -c wirecloud -- rm ./$D_FILE
echo "Re-creating elasticsearch index"
kubectl exec $WIRECLOUD_POD -n $NAMESPACE  -c wirecloud -- python3 manage.py rebuild_index  --noinput
