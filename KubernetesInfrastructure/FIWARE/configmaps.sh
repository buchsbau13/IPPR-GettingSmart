kubectl create configmap cygnus-config --namespace="fiware-graziot" --from-file=cygnus_config/agent.conf
kubectl create configmap comet-config --namespace="fiware-graziot" --from-file=comet_config/config.js
kubectl create configmap nginx-config --namespace="fiware-graziot" --from-file=nginx_config/nginx.conf
kubectl create configmap keyrock-config --namespace="fiware-graziot" --from-file=keyrock_config/config.js --from-file=keyrock_config/policy.ejs
kubectl create configmap pep-orion-config --namespace="fiware-graziot" --from-file=pep-orion_config/config.js
kubectl create configmap pep-idas-admin-config --namespace="fiware-graziot" --from-file=pep-idas-admin_config/config.js
kubectl create configmap pep-idas-sensor-config --namespace="fiware-graziot" --from-file=pep-idas-sensor_config/config.js
kubectl create configmap pep-comet-config --namespace="fiware-graziot" --from-file=pep-comet_config/config.js
kubectl create configmap nginx-wirecloud-config --namespace="fiware-graziot" --from-file=nginx_config0/nginx.conf
kubectl create configmap wirecloud-config --namespace="fiware-graziot" --from-file=wirecloud/settings.py --from-file=wirecloud/urls.py
