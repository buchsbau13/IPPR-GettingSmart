if [ "$#" -ne 1 ]
  then
    echo "Usage: copy-widgets.sh clustername"
    exit 1
fi
NAMESPACE=fiware-graziot
kubectl config use-context $1
WIRECLOUD_POD=$(kubectl get pod -l run=wirecloud -n $NAMESPACE -o go-template --template '{{range .items}}{{.metadata.name}}{{end}}')
echo "Wircloud pod: $WIRECLOUD_POD"
for f in $(ls -d widgets/*); do
  echo "Copying widget folder $f"
  kubectl cp $f $WIRECLOUD_POD:/opt/wirecloud_instance/data/widget_files/ -n $NAMESPACE -c wirecloud
done
