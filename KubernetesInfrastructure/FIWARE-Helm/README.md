# A Helm Chart for FIWARE

This folder contains a [helm](https://helm.sh/) chart for installing a complete FIWARE setup (see details [here](CHART.md))

## Prerequisites

For local installation you need `minikube`. It's important to start `minikube` with sufficient resources:

`minikube start --memory 8192 --cpus 4`

You can also bring up the kubernetes dashboard using the following command:

`minikube dashboard`

## Setting up local volumes folders

Some of the pods defined in this chart require local volumes that are mapped to folders on a node's filesystem. In the case of minikube there'll be only one node called `minikube`. In order to create the necessary folders first run `minikube ssh` in order to log into the node and than execute the following commands:

```bash
sudo mkdir -p /opt/fiware/mysql
sudo mkdir -p /opt/fiware/mongo
sudo mkdir -p /opt/fiware/wirecloud
sudo mkdir -p /opt/fiware/postgres
sudo mkdir -p /opt/fiware/elasticsearch
```

## Helm

Since this is a `helm` chart, you need to [install helm](https://docs.helm.sh/using_helm/#installing-helm).

After you have installed `helm`, you also need to install `tiller` (which is the server-side part of helm running inside your kubernetes cluster):

`helm init`

The default settings of this chart assume that the ip of your kubernetes node is `192.168.99.100`. Please check this IP by running `minikube ip` and update this address in `fiware/values.yaml` where ever it occurs.

## Installing the chart

Installing the chart is pretty straight forward. Simple run

`helm install fiware -n fiware --namespace fiware-iot --values=fiware/values-minikube.yaml`

This will send the entire configuration to your kubernetes cluster. Whenever you run `helm install`, helm will assign a new name to your deployment. You can get the names of all deployment using the command:

`helm list`

You can delete a deployment using:

`helm delete deploymentName`

where `deploymentName` is the name of your deployment as listed by `helm list` (should be `fiware` when using the statement from above).

Whenever you make changes to the configuration you can upgrade the current deployment by using:

`helm upgrade deploymentName fiware --values a_values_file
`

This will automatically perform a rolling upgrade of all pods concerned. If the update, however, concerns a `ConfigMap` you need to delete the dependent pods manually.

## Installing the Database dumps

This project comes with a snapshot of IdM (keyrock) configuration and some context broker as well as historic data. To restore these datasets run the following scripts:

 `restore-idm.sh minikube fiware-iot idm-backup/idm-mk-2019-03-10.sql`

Of course you can pick another dump as well. The fist argument of the script is the _context name_, which discribes a valid cluster as it is defined in your `~/kube/config` file. The second argument is the namespace of your fiware installation.

Until the database is restored, pep-proxies won't be able to connect with the IdM, without terminating with an error. Thus you need to check the logs of all pep proxies an propably need to delete them in order to force re-creation once the databes is restored.

## Dumping your IdM-Database

When you make changes to your IdM settings, don't forget to export these changes using the script `backup-idm.sh`:

`./backup-idm.sh minikube fiware-iot my-dumy-file.sql`


## Restoring Sensor Data

In order to get some sample data into your system you need to run this script:

`./restore-mongo.sh minikube fiware-iot`

where `fiware-iot` is the namespace of your fiware installation. The script will take the archive `mongo-dump.tar.bzip2` that contains historic data from October 2018.

## Setting up Wirecloud

To get wireloud populated with userdate workspaces use the following script, from folder `wirecloud-transfer`:

`./load_dump.hs minikube fiware-iot django-mk-2019-04-04.json`

This script deletes all existing configuration and imports the one from the dump file.

Additionally you can easily install custom widgets by running:

`./copy-widgets.sh minikube fiware-iot`

## Accessing your Services

Once your cluster is running to can get an overwiew of all services and how to access them. Simply use the command `minikube service list -n fiware-graziot`:

```
|----------------|--------------------|-----------------------------|
|   NAMESPACE    |        NAME        |             URL             |
|----------------|--------------------|-----------------------------|
| fiware-graziot | comet              | No node port                |
| fiware-graziot | cygnus             | No node port                |
| fiware-graziot | idas               | No node port                |
| fiware-graziot | keyrock            | http://192.168.99.100:30500 |
| fiware-graziot | memcached          | No node port                |
| fiware-graziot | mongo              | No node port                |
| fiware-graziot | mysql              | No node port                |
| fiware-graziot | ngsi-proxy-service | http://192.168.99.100:30003 |
| fiware-graziot | orion              | No node port                |
| fiware-graziot | pep-comet          | http://192.168.99.100:30666 |
| fiware-graziot | pep-idas-admin     | http://192.168.99.100:30041 |
| fiware-graziot | pep-idas-sensor    | http://192.168.99.100:30896 |
| fiware-graziot | pep-orion          | http://192.168.99.100:31026 |
| fiware-graziot | postgres           | No node port                |
| fiware-graziot | wirecloud          | http://192.168.99.100:30080 |
|----------------|--------------------|-----------------------------|
```

### Keyrock (Identity Manager)

The default endpoint for `keyrock` should be [http://192.168.99.100:30500](http://192.168.99.100:30500). The admin account that comes with the database dump is `admin@test.com` with password  `1234`.
