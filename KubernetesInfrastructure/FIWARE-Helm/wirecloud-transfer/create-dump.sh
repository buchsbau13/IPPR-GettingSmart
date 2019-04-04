if [ "$#" -ne 2 ]
  then
    echo "Usage: create-dump.sh clustername dump_file_name"
    exit 1
fi
NAMESPACE=fiware-graziot
kubectl config use-context $1
WIRECLOUD_POD=$(kubectl get pod -l run=wirecloud -n $NAMESPACE -o go-template --template '{{range .items}}{{.metadata.name}}{{end}}')
echo "Wircloud pod: $WIRECLOUD_POD"
kubectl exec $WIRECLOUD_POD -n $NAMESPACE -c wirecloud -- ./manage.py dumpdata --indent 2 --exclude=contenttypes --exclude=auth.permission > $2
