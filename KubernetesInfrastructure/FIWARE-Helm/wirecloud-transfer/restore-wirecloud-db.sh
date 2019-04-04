kubectl cp itg-dump-2019-03-26.sql postgres-0:/ -n fiware-graziot
kubectl exec  postgres-0 -n fiware-graziot -- psql -U postgres -f /itg-dump-2019-03-26.sql
