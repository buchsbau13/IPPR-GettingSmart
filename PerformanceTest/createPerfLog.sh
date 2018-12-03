#!/bin/bash
# Get CPU and RAM statistics from k8s pods

printf '>>> CPU and RAM usage of FIWARE pods for host '$1':\n'

while true
do
    # Print timestamp and statistics for chosen pods (every 2 seconds)
    date '+%Y-%m-%d %H:%M:%S %Z'
    kubectl describe nodes|grep -m 1 'CPU'
    kubectl describe nodes|grep 'mongo\|mysql\|idas\|orion\|cygnus\|keyrock\|authzforce'
    printf '\n'
    sleep 2
done