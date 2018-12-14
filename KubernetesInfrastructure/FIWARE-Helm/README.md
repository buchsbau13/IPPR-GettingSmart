# A Helm Chart for FIWARE

This folder contains a [helm](https://helm.sh/) chart for installing a complete FIWARE setup

## Prerequisites

For local installation you need `minikube`. It's important to start `minikube` with sufficient resources:

`minikube start --memory 8192 --cpus 4`

You can also bring up the kubernetes dashboard using the following command:

`minikube dashboard`

## Setting up local volumes folders

Some of the pods defined in this chart require local volumes that are mapped to folders on a node's filesystem. In the case of minikube there'll be only one node called `minikube`. In order to create the necessary folders first run `minikube ssh` in order to log into the node and than execute the folling commands:

```bash
sudo mkdir -p /opt/fiware/mysql
sudo mkdir -p /opt/fiware/mongo
sudo mkdir -p /opt/fiware/mysql
```

## Helm

Since this is a `helm` chart, you need to [install helm](https://docs.helm.sh/using_helm/#installing-helm).

After you have installed `helm`, you also need to install `tiller` (which is the server-side part of helm running inside your kubernetes cluster):

`helm init`

The default settings of this chart assume that the ip of your kubernetes node is `192.168.99.100`. Please check this IP by running `minikube ip` and update this address in `fiware/values.yaml` where ever it occurs.

## Installing the chart

Installing the chart is pretty straight forward. Simple run

`helm install fiware`

This will send the entire configuration to your kubernetes cluster. Whenever you run `helm install`, helm will assign a new name to your deployment. You can get the names of all deployment using the command:

`helm list`

You can install a deployment using:

`helm delete deploymentName`

where `deploymentName` is the name of your deployment as listed by `helm list`.

Whenever you make changes to the configuration you can upgrade the current deployment by using:

`helm upgrade deploymentName fiware`

This will automatically perform a rolling upgrade of all pods concerned. If the update, however, concerns a `ConfigMap` you need to delete the dependent pods manually.

## Installing the Database dumps

This project comes with a prototypic IdM (keyrock) configuration and context broker as well as historic data. To restore these datasets run the script `restore-idm.sh`.
