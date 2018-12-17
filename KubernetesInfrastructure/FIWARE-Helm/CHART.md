# Structure of the FIWARE Helm Chart

The actual chart is defined in folder `fiware` and has the following layout:

```
fiware
├── files
│   ├── comet
│   ├── cygnus
│   ├── keyrock
│   ├── nginx
│   │   └── certs
│   ├── pep-comet
│   ├── pep-idas-admin
│   ├── pep-idas-sensor
│   ├── pep-orion
│   └── wirecloud
└── templates
```

The `fiware` folder holds the `Chart.yaml` definition file with meta-information about the chart. It also conains the `values.yaml` file with values that are injected into other files using [helm's template language](https://docs.helm.sh/chart_template_guide/).
Thus, this file is the most important place for changing the properties of the resulting installation.

The `files` folder contains configuration files that are eventually turned into `ConfigMap` objects, whereas the actual kubernetes artifacts are defined inside the `templates` folder.
