import { BigNumber, ethers } from "ethers";  

import {  Common,  CustomChain, Chain, Hardfork } from '@ethereumjs/common'
import {  FeeMarketEIP1559Transaction } from '@ethereumjs/tx'  
import { getContractAddressesForChainOrThrow } from "@0x/contract-addresses";
import fs from "fs"  
import * as mustache from 'mustache'; 
import * as path from "path";  
import orderBookDetails from "../../config/Orderbook/0-OrderBook.json" 
import {writeFileSync} from "fs"; 
import abi from 'erc-20-abi' 
import hre from "hardhat"


import {
  allChains,
  configureChains,
  createClient,
  fetchFeeData,
} from "@sonicswap/wagmi-core";
import { publicProvider } from "@sonicswap/wagmi-core/providers/public";

import contractConfig from "../../config/config.json"

import axios from "axios";
import { hexlify } from "ethers/lib/utils";


/*
* Get etherscan key
*/
export const getEtherscanKey = (network:string) => { 

  let key = ''
  if (network === "mumbai" || network === "polygon"){ 
    key = process.env.POLYGONSCAN_API_KEY
  }else if(network === "goerli"){
    key = ''
  }else if(network === "snowtrace"){
    key = ''
  }else if(network === "sepolia" || network === "ethereum"){
    key = process.env.ETHERSCAN_API_KEY
  }else if(network === "hardhat"){
    key = ''
  }
  return key
}    

/*
* Get base url
*/
export const getEtherscanBaseURL = (network:string) => { 

  let url = ''
  if (network === "mumbai"){ 
    url = 'https://api-testnet.polygonscan.com/api'
  }else if(network === "goerli"){
    url = ''
  }else if(network === "snowtrace"){
    url = ''
  }else if(network === "sepolia"){
    url = 'https://api-sepolia.etherscan.io/api'
  }else if(network === "polygon"){
    url = 'https://api.polygonscan.com/api'
  }else if(network === "hardhat"){
    url = ''
  }else if(network === "ethereum"){
    url = 'https://api.etherscan.io/api'
  }
  return url
}  




/*
* Get provider for a specific network
*/
export const getProvider = (network:string) => { 

    let provider 
    if (network === "mumbai"){  
      provider = new ethers.providers.AlchemyProvider("maticmum",`${process.env.ALCHEMY_KEY_MUMBAI}`)   
    }else if(network === "goerli"){
      provider = new ethers.providers.AlchemyProvider("goerli",`${process.env.ALCHEMY_KEY_GORELI}`)  
    }else if(network === "snowtrace"){
      provider = new ethers.providers.JsonRpcProvider('https://api.avax-test.network/ext/bc/C/rpc')
    }else if(network === "sepolia"){ 
      provider = new ethers.providers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_KEY_SEPOLIA}`)
    }else if(network === "polygon"){
      provider = new ethers.providers.AlchemyProvider("matic",`${process.env.ALCHEMY_KEY_POLYGON}`)   
    }else if(network === "hardhat"){
      provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545') 
    }else if(network === "ethereum"){ 
      provider = new ethers.providers.JsonRpcProvider(`https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY_ETHEREUM}`) 
    }
    return provider
} 

/*
* Get @ethereumjs/common Common
*/
export const getCommons = (network:string) => {
    let common 
    if (network === "mumbai"){
        common = Common.custom(CustomChain.PolygonMumbai) 
    }else if(network === "goerli"){
      common = new Common({ chain: Chain.Goerli, hardfork: Hardfork.London })
    }else if(network === "snowtrace"){
      common = Common.custom({ chainId: 43113 })
    }else if(network === "sepolia"){
      common = Common.custom({ chainId: 11155111 })
    }else if(network === "polygon"){
      common = Common.custom(CustomChain.PolygonMainnet) 
    }else if(network === "hardhat"){
      common = Common.custom({ chainId: 31337 })
    }else if(network === "ethereum"){
      common = new Common({ chain: Chain.Mainnet, hardfork: Hardfork.London })
    }
    
    return common
}

/*
* Get transaction data (bytecode + args)
*/
export const getTransactionData = async (provider: any, address:string): Promise<string> => { 

    const transaction = await provider.getTransaction(address)  

    return transaction.data
}   

/**
 *Replace all DISpair instances 
 */
 export const getTransactionDataForZeroEx = (txData:string,fromNetwork:string,toNetwork:string) => { 

  const fromProvider = getProvider(fromNetwork)
  const toProvider = getProvider(toNetwork)  

  const { exchangeProxy: fromNetworkProxy } = getContractAddressesForChainOrThrow(fromProvider._network.chainId);
  const { exchangeProxy: toNetworkProxy } = getContractAddressesForChainOrThrow(toProvider._network.chainId);  

  
  txData = txData.toLocaleLowerCase()
  const fromContractConfig = contractConfig.contracts[fromNetwork]
  const toContractConfig = contractConfig.contracts[toNetwork] 

  if(txData.includes(fromContractConfig["orderbook"]["address"].split('x')[1].toLowerCase())){ 
    txData = txData.replace(fromContractConfig["orderbook"]["address"].split('x')[1].toLowerCase(), toContractConfig["orderbook"]["address"].split('x')[1].toLowerCase())
  }
  if(txData.includes(fromNetworkProxy.split('x')[1].toLowerCase())){
    txData = txData.replace(fromNetworkProxy.split('x')[1].toLowerCase(), toNetworkProxy.split('x')[1].toLowerCase())
  }
  return txData 
}   

/**
 * @returns a random 32 byte number in hexstring format
 */
export function randomUint256(): string {
  return ethers.utils.hexZeroPad(ethers.utils.randomBytes(32), 32);
} 


/**
 *Replace all DISpair instances 
 */
export const getTransactionDataForNetwork =  (txData:string,fromNetwork:string,toNetwork:string) => {
  
  txData = txData.toLocaleLowerCase()
  const fromNetworkConfig = contractConfig.contracts[fromNetwork]
  const toNetworkConfig = contractConfig.contracts[toNetwork]  


  if(txData.includes(fromNetworkConfig["interpreter"]["address"].split('x')[1].toLowerCase())){ 
    txData = txData.replace(fromNetworkConfig["interpreter"]["address"].split('x')[1].toLowerCase(), toNetworkConfig["interpreter"]["address"].split('x')[1].toLowerCase())
  }
  if(txData.includes(fromNetworkConfig["store"]["address"].split('x')[1].toLowerCase())){
    txData = txData.replace(fromNetworkConfig["store"]["address"].split('x')[1].toLowerCase(), toNetworkConfig["store"]["address"].split('x')[1].toLowerCase())
  }
  if(txData.includes(fromNetworkConfig["expressionDeployer"]["address"].split('x')[1].toLowerCase())){
    txData = txData.replace(fromNetworkConfig["expressionDeployer"]["address"].split('x')[1].toLowerCase(), toNetworkConfig["expressionDeployer"]["address"].split('x')[1].toLowerCase())
  }
  return txData 
}  

export const getGasDataForPolygon = async () => {

  let gasData = await axios.get('https://gasstation-mainnet.matic.network/v2') 
  return gasData
}

export const estimateFeeData = async ( 
  chainProvider:any ,
): Promise<{
  gasPrice: BigNumber;
  maxFeePerGas: BigNumber;
  maxPriorityFeePerGas: BigNumber;
}> => { 
  if (chainProvider._network.chainId === 137) {  
    const gasDataForPolygon = await getGasDataForPolygon()
    return {
      gasPrice: BigNumber.from("21000"),
      maxFeePerGas : ethers.utils.parseUnits(
        Math.ceil(gasDataForPolygon.data.fast.maxFee).toString(),
        "gwei"
      ) , 
      maxPriorityFeePerGas : ethers.utils.parseUnits(
        Math.ceil(gasDataForPolygon.data.fast.maxPriorityFee).toString(),
        "gwei"
      ) 
    }

  }else if (chainProvider._network.chainId === 31337) {
    return {
      gasPrice: BigNumber.from("1980000104"),
      maxFeePerGas: BigNumber.from("1500000030"),
      maxPriorityFeePerGas: BigNumber.from("1500000000"),
    };
  }else if(chainProvider._network.chainId === 43113 || chainProvider._network.chainId === 11155111 ){
    // Snowtrace Network
    const feeData = await chainProvider.getFeeData();   
    return {
      gasPrice: BigNumber.from("0x7A1200"),
      maxPriorityFeePerGas: feeData["maxPriorityFeePerGas"],
      maxFeePerGas: feeData["maxFeePerGas"],
    }
  }else if(chainProvider._network.chainId === 1 ){ 
    const feeData = await chainProvider.getFeeData(); 
    
    return {
      gasPrice: feeData["gasPrice"],
      maxPriorityFeePerGas: feeData["maxPriorityFeePerGas"],
      maxFeePerGas: feeData["maxFeePerGas"],
    }

  } else { 
    const chain = allChains.find((chain) => chain.id === chainProvider._network.chainId); 
    const { provider, webSocketProvider } = configureChains(
      [chain],
      [publicProvider()]
    );

    createClient({
      autoConnect: true,
      provider,
      webSocketProvider,
    });
    const { gasPrice, maxFeePerGas, maxPriorityFeePerGas } =
      await fetchFeeData();

    return {
      gasPrice,
      maxFeePerGas,
      maxPriorityFeePerGas,
    }; 

  }
};
 

export const fetchFile = (_path: string): string => {
  try {
    return fs.readFileSync(_path).toString();
  } catch (error) {
    console.log(error);
    return "";
  }
};   

export const encodeMeta = (data: string) => {
  return (
    "0x" +
    BigInt(0xff0a89c674ee7874n).toString(16).toLowerCase() +
    hexlify(ethers.utils.toUtf8Bytes(data)).split("x")[1]
  );
}; 

/*
* Deploy transaction
*/
export const deployContractToNetwork = async (provider: any, common: Common,  priKey: string, transactionData: string) => { 

    console.log("Deploying Contract...") 

    const signer  = new ethers.Wallet(priKey,provider)   

    const nonce = await provider.getTransactionCount(signer.address)  
    
    const feeData = await estimateFeeData(provider)   


    // An estimate may not be accurate since there could be another transaction on the network that was not accounted for,
    // but after being mined affected relevant state.
    // https://docs.ethers.org/v5/api/providers/provider/#Provider-estimateGas
    const gasLimit = await provider.estimateGas({
      data: transactionData
    }) 
 
  
    // hard conded values to be calculated
    const txData = { 
      nonce: ethers.BigNumber.from(nonce).toHexString() ,
      data : transactionData ,
      gasLimit : gasLimit.toHexString(), 
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas.toHexString(), 
      maxFeePerGas: feeData.maxFeePerGas.toHexString(),
      type: '0x02'
    }   
        
    // Generate Transaction 
    const tx = FeeMarketEIP1559Transaction.fromTxData(txData, { common })   
  
    const privateKey = Buffer.from(
      priKey,
      'hex'
    )
    
    // Sign Transaction 
    const signedTx = tx.sign(privateKey)
  
    // Send the transaction
    const deployTransaction = await provider.sendTransaction(
      "0x" + signedTx.serialize().toString("hex")
    ); 
    
    return deployTransaction
  
  }   


 



 

 


 
