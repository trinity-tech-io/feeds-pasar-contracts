### Introduction

Here are two program tools for developers to deploy the contracts and upgrade the deployment of them:

- deploy.js
- upgrade.js

### How to deploy contracts

Remember to config the values in ***deploy_config.js*** , and run the command below under **tools** folder:

```shell
$ node deploy.js
```

### How to upgrade the contracts

You have to config the following addresses in ***upgrade_config.js***:

- proxiedNftAddr;
- newNftAddr;
- proxiedPasarAddr;
- newPasarAddr

If you only meant to upgrade the NFT contract, then can leave the values of **Pasar** unconfiged.

Then run the command below same as deployment

```shell
$ node upgrade.js
```

### Generate the ABIs for contracts

Run the following command to compile the contracts and generate the ABIs:
```shell
$ node abigen.js
```

