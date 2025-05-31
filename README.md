# hackmd-updater

Provide a simple REST API endpoint ... meant to be called from the GitHub Action for [hackmd-notes](https://github.com/hexcamp/hackmd-notes/actions) after the built website has been uploaded to the
IPFS cluster.

```
curl -X POST http://<api endpoint>/publish/bafybeievdt6abm37tjhec6ycyaqmu66obozwbp6hbovfvwk4jfqzye7p5m
```

It will use `ipfs dag get <cid>` to discover the CIDs for each website that is uploaded in a first level subdirectory, with the naming convention `<hexagon id>-*`.  It will then update this [CSV file](https://github.com/hexcamp/hexcamp-coredns-sites/blob/main/jim.csv) with the updated CIDs and push a git commit to kick off the publishing pipeline.

## Config

.env:

```
GITHUB_PAT=<github personal access token>
IPFS_API=http://localhost:5001/api/v0
REPO_ORG=hexcamp
REPO_NAME=hexcamp-coredns-sites
```

## License

MIT or Apache 2