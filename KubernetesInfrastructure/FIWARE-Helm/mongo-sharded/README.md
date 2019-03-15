# Helm Chart for a Sharded MongoDB cluster

This folder contains a helm chart for rolling out a sharded mongodb cluster.

## Prerequesites

Before you can install the database cluster, you need to create the necessary folder structure for
the persistent volumes that will hold the actual database data. Therefore you should use the provided
[ansible playbook](../ansible-mongo-sharded/README.md).

After this is done, create a new random key file using the script `create-mongo-keyfile.sh`. Please do this only once, since chaging the key would lock the rest of your installation!

## Installing the Database

The command to install the database is:

`helm install -n [release_name] --namespace [namespace] mongo-sharded --values [values_file]`

You need to run this command from the folder above this one (`mongo-sharded` needs to be direct sub folder)!

`release_name` stands for the name of the release as it is maintained by helm. If you ommit this flag, the release will be a random name, resulting in a hard to read installation, since the release name is part of all created components. Therefore a recommendation would be `mongo` or `mongo-sharded`.

`namespace` is the kubernetes namespace in which the cluster will be deployed

`values_file` is the single most important component, since it describes the layout of your clustered database installation!

## Configuration

This helm chart will create all [required components](https://docs.mongodb.com/manual/core/sharded-cluster-components/) for the sharded database cluster. To describe the concrete layout (bsically the number of shard and how to distribute them over the cluster), you need to provide a _values file_. Here is a sample file:

```yaml
mongoVersion: 4.0.6
router:
  replicas: 2
config:
  replicas: 3
  path: /opt/mongo/config
  size: 10Gi
  hosts:
    - node7
    - node4
    - node2
shards:
  - name: shard1
    path: /opt/mongo/shard1
    size: 10Gi
    hosts:
      - node1
      - node2
      - node3
  - name: shard2
    path: /opt/mongo/shard2
    size: 10Gi
    hosts:
      - node5
      - node6
      - node7
  - name: shard3
    path: /opt/mongo/shard3
    size: 10Gi
    hosts:
      - node3
      - node4
      - node5
```

Each `path` in the file is the host folder that is going to be used by a `PersistentVolume`. These folders need to be created upfront, best using the provided [ansible playbook](../ansible-mongo-sharded/README.md).

All configuration elements that will eventually end up as a `StatefulSet` (`config` and `shards`) need serveral hosts. The __number of hosts has to be equal to the number of replicas__, since every replica has to be deployed to a different host.

`shards` contains a list of `shard` elements. You can extend this list but you need to have at least one shard. Every `shard` needs to have a unique name.

The `size` will be used for the created `PersistentVolume` and claims.

## Post Installation Steps

Once you have rolled out your cluster, you need to add the necessary configuraion information to group your configuration and shard servers logically and to configure the router service by running `init-cluster.sh`. Please adapt the `NAME` (= release name) and `NAMESPACE` variables to your situtation.
