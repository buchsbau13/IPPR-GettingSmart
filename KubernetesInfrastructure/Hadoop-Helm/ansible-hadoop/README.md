# ansible-hadoop
Ansible playbook that prepares the provided k8s cluster for hadoop deployment. The playbook
- installs nfs-utils on all a nodes
- creates required nfs-shares on one node
- creates folders for persistent hdfs volumes
## Prerequisites
Copy and/or edit `hosts` file to match the given k8s cluster
```
[nfs]
I101V180.intra.graz.at ansible_host=10.1.101.180 ansible_user=e20143 ansible_become=yes
[nfs:vars]
network=10.1.101.0/24

[datanodes]
i101v181 ansible_host=10.1.101.181 ansible_user=e20143 ansible_become=yes
i101v182 ansible_host=10.1.101.182 ansible_user=e20143 ansible_become=yes
i101v183 ansible_host=10.1.101.183 ansible_user=e20143 ansible_become=yes
```
## Run playbook
Run the playbook with inventory file with the following command
```
ansible-playbook -i hosts setup-hadoop-cluster-nodes.yaml 
```
