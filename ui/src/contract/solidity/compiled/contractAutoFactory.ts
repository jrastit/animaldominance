import { ethers } from 'ethers'
import { TransactionManager } from '../../../util/TransactionManager'
import { ContractGeneric, initContract, ContractFunction } from '../../../util/ContractGeneric'

import jsonNFT from './NFT.json'
import jsonAnimalDominance from './AnimalDominance.json'
import jsonGameManager from './GameManager.json'
import jsonGameList from './GameList.json'
import jsonCardList from './CardList.json'
import jsonPlayGame from './PlayGame.json'
import jsonPlayGameFactory from './PlayGameFactory.json'
import jsonTrading from './Trading.json'
import jsonPlayActionLib from './PlayActionLib.json'
import jsonPlayBot from './PlayBot.json'

export class ContractNFT extends ContractGeneric {
	readonly [key: string]: ContractFunction | any
	constructor(contract: ethers.Contract, transactionManager: TransactionManager) {
		super(contract, transactionManager)
		initContract(this, jsonNFT.abi)
	}
}

export class ContractAnimalDominance extends ContractGeneric {
	readonly [key: string]: ContractFunction | any
	constructor(contract: ethers.Contract, transactionManager: TransactionManager) {
		super(contract, transactionManager)
		initContract(this, jsonAnimalDominance.abi)
	}
}

export class ContractGameManager extends ContractGeneric {
	readonly [key: string]: ContractFunction | any
	constructor(contract: ethers.Contract, transactionManager: TransactionManager) {
		super(contract, transactionManager)
		initContract(this, jsonGameManager.abi)
	}
}

export class ContractGameList extends ContractGeneric {
	readonly [key: string]: ContractFunction | any
	constructor(contract: ethers.Contract, transactionManager: TransactionManager) {
		super(contract, transactionManager)
		initContract(this, jsonGameList.abi)
	}
}

export class ContractCardList extends ContractGeneric {
	readonly [key: string]: ContractFunction | any
	constructor(contract: ethers.Contract, transactionManager: TransactionManager) {
		super(contract, transactionManager)
		initContract(this, jsonCardList.abi)
	}
}

export class ContractPlayGame extends ContractGeneric {
	readonly [key: string]: ContractFunction | any
	constructor(contract: ethers.Contract, transactionManager: TransactionManager) {
		super(contract, transactionManager)
		initContract(this, jsonPlayGame.abi)
	}
}

export class ContractPlayGameFactory extends ContractGeneric {
	readonly [key: string]: ContractFunction | any
	constructor(contract: ethers.Contract, transactionManager: TransactionManager) {
		super(contract, transactionManager)
		initContract(this, jsonPlayGameFactory.abi)
	}
}

export class ContractTrading extends ContractGeneric {
	readonly [key: string]: ContractFunction | any
	constructor(contract: ethers.Contract, transactionManager: TransactionManager) {
		super(contract, transactionManager)
		initContract(this, jsonTrading.abi)
	}
}

export class ContractPlayActionLib extends ContractGeneric {
	readonly [key: string]: ContractFunction | any
	constructor(contract: ethers.Contract, transactionManager: TransactionManager) {
		super(contract, transactionManager)
		initContract(this, jsonPlayActionLib.abi)
	}
}

export class ContractPlayBot extends ContractGeneric {
	readonly [key: string]: ContractFunction | any
	constructor(contract: ethers.Contract, transactionManager: TransactionManager) {
		super(contract, transactionManager)
		initContract(this, jsonPlayBot.abi)
	}
}


export const createContractNFT = async (
	_owner : string,
	_royaltyFraction : number,
	_reicever : string,
	_baseURI : string,
	_contractHash : ethers.BigNumber,
	signer: ethers.Signer
) => {
	const factory = new ethers.ContractFactory(
		jsonNFT.abi,
		jsonNFT.bytecode,
		signer
	)
	const contract = await factory.deploy(
		_owner,
		_royaltyFraction,
		_reicever,
		_baseURI,
		_contractHash,
	)
	await contract.deployed()
	return contract
}

export const createContractAnimalDominance = async (
	_contractHash : ethers.BigNumber,
	signer: ethers.Signer
) => {
	const factory = new ethers.ContractFactory(
		jsonAnimalDominance.abi,
		jsonAnimalDominance.bytecode,
		signer
	)
	const contract = await factory.deploy(
		_contractHash,
	)
	await contract.deployed()
	return contract
}

export const createContractGameManager = async (
	_animalDominance : {address : string},
	_cardList : {address : string},
	signer: ethers.Signer
) => {
	const factory = new ethers.ContractFactory(
		jsonGameManager.abi,
		jsonGameManager.bytecode,
		signer
	)
	const contract = await factory.deploy(
		_animalDominance.address,
		_cardList.address,
	)
	await contract.deployed()
	return contract
}

export const createContractGameList = async (
	_gameManager : {address : string},
	_playGameFactory : {address : string},
	_playActionLib : {address : string},
	_contractHash : ethers.BigNumber,
	signer: ethers.Signer
) => {
	const factory = new ethers.ContractFactory(
		jsonGameList.abi,
		jsonGameList.bytecode,
		signer
	)
	const contract = await factory.deploy(
		_gameManager.address,
		_playGameFactory.address,
		_playActionLib.address,
		_contractHash,
	)
	await contract.deployed()
	return contract
}

export const createContractCardList = async (
	_contractHash : ethers.BigNumber,
	signer: ethers.Signer
) => {
	const factory = new ethers.ContractFactory(
		jsonCardList.abi,
		jsonCardList.bytecode,
		signer
	)
	const contract = await factory.deploy(
		_contractHash,
	)
	await contract.deployed()
	return contract
}

export const createContractPlayGame = async (
	signer: ethers.Signer
) => {
	const factory = new ethers.ContractFactory(
		jsonPlayGame.abi,
		jsonPlayGame.bytecode,
		signer
	)
	const contract = await factory.deploy(
	)
	await contract.deployed()
	return contract
}

export const createContractPlayGameFactory = async (
	_contractHash : ethers.BigNumber,
	signer: ethers.Signer
) => {
	const factory = new ethers.ContractFactory(
		jsonPlayGameFactory.abi,
		jsonPlayGameFactory.bytecode,
		signer
	)
	const contract = await factory.deploy(
		_contractHash,
	)
	await contract.deployed()
	return contract
}

export const createContractTrading = async (
	_gameManager : {address : string},
	_contractHash : ethers.BigNumber,
	signer: ethers.Signer
) => {
	const factory = new ethers.ContractFactory(
		jsonTrading.abi,
		jsonTrading.bytecode,
		signer
	)
	const contract = await factory.deploy(
		_gameManager.address,
		_contractHash,
	)
	await contract.deployed()
	return contract
}

export const createContractPlayActionLib = async (
	_contractHash : ethers.BigNumber,
	signer: ethers.Signer
) => {
	const factory = new ethers.ContractFactory(
		jsonPlayActionLib.abi,
		jsonPlayActionLib.bytecode,
		signer
	)
	const contract = await factory.deploy(
		_contractHash,
	)
	await contract.deployed()
	return contract
}

export const createContractPlayBot = async (
	_contractHash : ethers.BigNumber,
	signer: ethers.Signer
) => {
	const factory = new ethers.ContractFactory(
		jsonPlayBot.abi,
		jsonPlayBot.bytecode,
		signer
	)
	const contract = await factory.deploy(
		_contractHash,
	)
	await contract.deployed()
	return contract
}


export const createWithManagerContractNFT = async (
	_owner : string,
	_royaltyFraction : number,
	_reicever : string,
	_baseURI : string,
	_contractHash : ethers.BigNumber,
	transactionManager: TransactionManager
) => {
	const factory = new ethers.ContractFactory(
		jsonNFT.abi,
		jsonNFT.bytecode,
	)
	const utx = factory.getDeployTransaction(
		_owner,
		_royaltyFraction,
		_reicever,
		_baseURI,
		_contractHash,
	)
	return new ContractNFT(await transactionManager.sendContractTx(
		utx,
		getContractNFT,
		 'Create contract NFT',
	), transactionManager)
}

export const createWithManagerContractAnimalDominance = async (
	_contractHash : ethers.BigNumber,
	transactionManager: TransactionManager
) => {
	const factory = new ethers.ContractFactory(
		jsonAnimalDominance.abi,
		jsonAnimalDominance.bytecode,
	)
	const utx = factory.getDeployTransaction(
		_contractHash,
	)
	return new ContractAnimalDominance(await transactionManager.sendContractTx(
		utx,
		getContractAnimalDominance,
		 'Create contract AnimalDominance',
	), transactionManager)
}

export const createWithManagerContractGameManager = async (
	_animalDominance : {address : string},
	_cardList : {address : string},
	transactionManager: TransactionManager
) => {
	const factory = new ethers.ContractFactory(
		jsonGameManager.abi,
		jsonGameManager.bytecode,
	)
	const utx = factory.getDeployTransaction(
		_animalDominance.address,
		_cardList.address,
	)
	return new ContractGameManager(await transactionManager.sendContractTx(
		utx,
		getContractGameManager,
		 'Create contract GameManager',
	), transactionManager)
}

export const createWithManagerContractGameList = async (
	_gameManager : {address : string},
	_playGameFactory : {address : string},
	_playActionLib : {address : string},
	_contractHash : ethers.BigNumber,
	transactionManager: TransactionManager
) => {
	const factory = new ethers.ContractFactory(
		jsonGameList.abi,
		jsonGameList.bytecode,
	)
	const utx = factory.getDeployTransaction(
		_gameManager.address,
		_playGameFactory.address,
		_playActionLib.address,
		_contractHash,
	)
	return new ContractGameList(await transactionManager.sendContractTx(
		utx,
		getContractGameList,
		 'Create contract GameList',
	), transactionManager)
}

export const createWithManagerContractCardList = async (
	_contractHash : ethers.BigNumber,
	transactionManager: TransactionManager
) => {
	const factory = new ethers.ContractFactory(
		jsonCardList.abi,
		jsonCardList.bytecode,
	)
	const utx = factory.getDeployTransaction(
		_contractHash,
	)
	return new ContractCardList(await transactionManager.sendContractTx(
		utx,
		getContractCardList,
		 'Create contract CardList',
	), transactionManager)
}

export const createWithManagerContractPlayGame = async (
	transactionManager: TransactionManager
) => {
	const factory = new ethers.ContractFactory(
		jsonPlayGame.abi,
		jsonPlayGame.bytecode,
	)
	const utx = factory.getDeployTransaction(
	)
	return new ContractPlayGame(await transactionManager.sendContractTx(
		utx,
		getContractPlayGame,
		 'Create contract PlayGame',
	), transactionManager)
}

export const createWithManagerContractPlayGameFactory = async (
	_contractHash : ethers.BigNumber,
	transactionManager: TransactionManager
) => {
	const factory = new ethers.ContractFactory(
		jsonPlayGameFactory.abi,
		jsonPlayGameFactory.bytecode,
	)
	const utx = factory.getDeployTransaction(
		_contractHash,
	)
	return new ContractPlayGameFactory(await transactionManager.sendContractTx(
		utx,
		getContractPlayGameFactory,
		 'Create contract PlayGameFactory',
	), transactionManager)
}

export const createWithManagerContractTrading = async (
	_gameManager : {address : string},
	_contractHash : ethers.BigNumber,
	transactionManager: TransactionManager
) => {
	const factory = new ethers.ContractFactory(
		jsonTrading.abi,
		jsonTrading.bytecode,
	)
	const utx = factory.getDeployTransaction(
		_gameManager.address,
		_contractHash,
	)
	return new ContractTrading(await transactionManager.sendContractTx(
		utx,
		getContractTrading,
		 'Create contract Trading',
	), transactionManager)
}

export const createWithManagerContractPlayActionLib = async (
	_contractHash : ethers.BigNumber,
	transactionManager: TransactionManager
) => {
	const factory = new ethers.ContractFactory(
		jsonPlayActionLib.abi,
		jsonPlayActionLib.bytecode,
	)
	const utx = factory.getDeployTransaction(
		_contractHash,
	)
	return new ContractPlayActionLib(await transactionManager.sendContractTx(
		utx,
		getContractPlayActionLib,
		 'Create contract PlayActionLib',
	), transactionManager)
}

export const createWithManagerContractPlayBot = async (
	_contractHash : ethers.BigNumber,
	transactionManager: TransactionManager
) => {
	const factory = new ethers.ContractFactory(
		jsonPlayBot.abi,
		jsonPlayBot.bytecode,
	)
	const utx = factory.getDeployTransaction(
		_contractHash,
	)
	return new ContractPlayBot(await transactionManager.sendContractTx(
		utx,
		getContractPlayBot,
		 'Create contract PlayBot',
	), transactionManager)
}


export const getContractNFT = (
	contractAddress: string,
	signer: ethers.Signer,
) => {
	return new ethers.Contract(
		contractAddress,
		jsonNFT.abi,
		signer,
	)
}

export const getContractAnimalDominance = (
	contractAddress: string,
	signer: ethers.Signer,
) => {
	return new ethers.Contract(
		contractAddress,
		jsonAnimalDominance.abi,
		signer,
	)
}

export const getContractGameManager = (
	contractAddress: string,
	signer: ethers.Signer,
) => {
	return new ethers.Contract(
		contractAddress,
		jsonGameManager.abi,
		signer,
	)
}

export const getContractGameList = (
	contractAddress: string,
	signer: ethers.Signer,
) => {
	return new ethers.Contract(
		contractAddress,
		jsonGameList.abi,
		signer,
	)
}

export const getContractCardList = (
	contractAddress: string,
	signer: ethers.Signer,
) => {
	return new ethers.Contract(
		contractAddress,
		jsonCardList.abi,
		signer,
	)
}

export const getContractPlayGame = (
	contractAddress: string,
	signer: ethers.Signer,
) => {
	return new ethers.Contract(
		contractAddress,
		jsonPlayGame.abi,
		signer,
	)
}

export const getContractPlayGameFactory = (
	contractAddress: string,
	signer: ethers.Signer,
) => {
	return new ethers.Contract(
		contractAddress,
		jsonPlayGameFactory.abi,
		signer,
	)
}

export const getContractTrading = (
	contractAddress: string,
	signer: ethers.Signer,
) => {
	return new ethers.Contract(
		contractAddress,
		jsonTrading.abi,
		signer,
	)
}

export const getContractPlayActionLib = (
	contractAddress: string,
	signer: ethers.Signer,
) => {
	return new ethers.Contract(
		contractAddress,
		jsonPlayActionLib.abi,
		signer,
	)
}

export const getContractPlayBot = (
	contractAddress: string,
	signer: ethers.Signer,
) => {
	return new ethers.Contract(
		contractAddress,
		jsonPlayBot.abi,
		signer,
	)
}


export const getWithManagerContractNFT = (
	contractAddress: string,
	transactionManager: TransactionManager
) => {
	return new ContractNFT(new ethers.Contract(
		contractAddress,
		jsonNFT.abi,
		transactionManager.signer,
	), transactionManager)
}

export const getWithManagerContractAnimalDominance = (
	contractAddress: string,
	transactionManager: TransactionManager
) => {
	return new ContractAnimalDominance(new ethers.Contract(
		contractAddress,
		jsonAnimalDominance.abi,
		transactionManager.signer,
	), transactionManager)
}

export const getWithManagerContractGameManager = (
	contractAddress: string,
	transactionManager: TransactionManager
) => {
	return new ContractGameManager(new ethers.Contract(
		contractAddress,
		jsonGameManager.abi,
		transactionManager.signer,
	), transactionManager)
}

export const getWithManagerContractGameList = (
	contractAddress: string,
	transactionManager: TransactionManager
) => {
	return new ContractGameList(new ethers.Contract(
		contractAddress,
		jsonGameList.abi,
		transactionManager.signer,
	), transactionManager)
}

export const getWithManagerContractCardList = (
	contractAddress: string,
	transactionManager: TransactionManager
) => {
	return new ContractCardList(new ethers.Contract(
		contractAddress,
		jsonCardList.abi,
		transactionManager.signer,
	), transactionManager)
}

export const getWithManagerContractPlayGame = (
	contractAddress: string,
	transactionManager: TransactionManager
) => {
	return new ContractPlayGame(new ethers.Contract(
		contractAddress,
		jsonPlayGame.abi,
		transactionManager.signer,
	), transactionManager)
}

export const getWithManagerContractPlayGameFactory = (
	contractAddress: string,
	transactionManager: TransactionManager
) => {
	return new ContractPlayGameFactory(new ethers.Contract(
		contractAddress,
		jsonPlayGameFactory.abi,
		transactionManager.signer,
	), transactionManager)
}

export const getWithManagerContractTrading = (
	contractAddress: string,
	transactionManager: TransactionManager
) => {
	return new ContractTrading(new ethers.Contract(
		contractAddress,
		jsonTrading.abi,
		transactionManager.signer,
	), transactionManager)
}

export const getWithManagerContractPlayActionLib = (
	contractAddress: string,
	transactionManager: TransactionManager
) => {
	return new ContractPlayActionLib(new ethers.Contract(
		contractAddress,
		jsonPlayActionLib.abi,
		transactionManager.signer,
	), transactionManager)
}

export const getWithManagerContractPlayBot = (
	contractAddress: string,
	transactionManager: TransactionManager
) => {
	return new ContractPlayBot(new ethers.Contract(
		contractAddress,
		jsonPlayBot.abi,
		transactionManager.signer,
	), transactionManager)
}
export const getHashContractNFT = (
) => {
	return ethers.BigNumber.from('0xc044a91f59494944482b23d115565da26d61d92d204e14452ec220fd8f279096') 
}

export const getHashContractAnimalDominance = (
) => {
	return ethers.BigNumber.from('0x046346f81943de75bafc5b0f8407b382c331f72381f763bfc7df38096b363362') 
}

export const getHashContractGameManager = (
) => {
	return ethers.BigNumber.from('0x74be6ec1ddae9e7e7fe3bd5bada5deca79c879e09ec1431a2fe3974179be3b81') 
}

export const getHashContractGameList = (
) => {
	return ethers.BigNumber.from('0x8e46f35dc24513bdb173c51aab146a9cb02dfaa126e0ccaa2c63fa5aaf38c5e8') 
}

export const getHashContractCardList = (
) => {
	return ethers.BigNumber.from('0xf26ce7cf381357d9f5339c4de93d7e946077762cd57bba8d49966237db4d01c8') 
}

export const getHashContractPlayGame = (
) => {
	return ethers.BigNumber.from('0x0c08cd175cb8b5b679e52536d6e6d9772e2bc1c35df8f5d1dac57baed4d8ca0e') 
}

export const getHashContractPlayGameFactory = (
) => {
	return ethers.BigNumber.from('0xab42fccd57d0f930f0b92798a64be3d3bc15bc1ce0d934d5505795887dab9673') 
}

export const getHashContractTrading = (
) => {
	return ethers.BigNumber.from('0xbe894a6c511b2142ebef430b6fa04c2ef2792d06cc716c13ffb47ebdf91af604') 
}

export const getHashContractPlayActionLib = (
) => {
	return ethers.BigNumber.from('0x110599a6a49b965b68261401f323a2d231d68f8fd19d4d44387b7c10fe118b53') 
}

export const getHashContractPlayBot = (
) => {
	return ethers.BigNumber.from('0xb5952d7d67564f61b19ecfc501927e83db8cf5ad70e4ce340e550fdb0a3c82b4') 
}


