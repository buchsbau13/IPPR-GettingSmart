# Helm Chart for Hadoop Cluster
Helm chart to rollout a Hadoop Cluster consisting of
- YARN (ResourceManager & NameNode)
- DataNode(s)
- Spark
## Prerequesites
- Prepare cluster with the required folders structure for the PerstistenVolumes. The following [ansible playbook](../ansible-hadoop/README.md) does this job for you.
## Install the helm
To deploy the hadoop-cluster use the following command
```
helm install ../hadoop -n [release_name] -f [values_file] --namespace [namespace_name]
```
- `release-name` represents the name of the release as it is used by helm
- `values-file` contains the important configuration values for the target cluster. The following two value files represent the required configuration for a successfull deployment.
  - `values-itg-cluster.yaml` - configuration for the itg kubernetes cluster
  - `values-test-cluster.yaml` - configuration for testing with testcluster [simple-k8s-simple-3node](https://github.com/loete/ansible-k8s-simple-3node) 
- `namespace-name` respresents the kubernetes namespace where the hadoop-cluster should be deployed.