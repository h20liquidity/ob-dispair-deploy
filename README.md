## Deploy Contracts


### Goal
- Deploy Rain Protocol contracts to new networks. 

#### Setup Environment 
- Create a .env file in the **root of the project** and populate it with following fields : 
```
DEPLOYMENT_KEY=<private-key-of-the-wallet>

ALCHEMY_KEY_MUMBAI=
ALCHEMY_KEY_POLYGON=
ALCHEMY_KEY_SEPOLIA=
ALCHEMY_KEY_ETHEREUM= 

POLYGONSCAN_API_KEY=
ETHERSCAN_API_KEY= 
```
#### Deploying Contracts
Once you set up the environment we can deploy the contracts. 
The script clones the contract deployed on one network to another.

To deploy contracts **run** the following command in shell from the **root of the project**.
```sh
ts-node scripts/deployContracts.ts --from mumbai --to ethereum
```
Where arguments for the script are:

- `--from, -f <network name>` : Network name of originating network. Any of ["mumbai","sepolia","polygon","ethereum"]. Usally this will be a test network.
- `--to, -t <network name>` : Network name of target network where new contract is to be deployed.Any of ["mumbai","sepolia","polygon","ethereum"]. Usally this will be a main network for a chain.

Wait for all the contracts to be deployed and verified.



