import { ethers } from 'ethers'
import { TransactionManager } from '../../../util/TransactionManager'
import { ContractGeneric, initContract, ContractFunction } from '../../../util/ContractGeneric'

import jsonAnimalDominance from './AnimalDominance.json'
import jsonGameManager from './GameManager.json'
import jsonPlayGame from './PlayGame.json'
import jsonPlayGameFactory from './PlayGameFactory.json'
import jsonTrading from './Trading.json'
import jsonPlayActionLib from './PlayActionLib.json'

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
	_playGameFactory : {address : string},
	_playActionLib : {address : string},
	signer: ethers.Signer
) => {
	const factory = new ethers.ContractFactory(
		jsonGameManager.abi,
		jsonGameManager.bytecode,
		signer
	)
	const contract = await factory.deploy(
		_playGameFactory.address,
		_playActionLib.address,
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
	signer: ethers.Signer
) => {
	const factory = new ethers.ContractFactory(
		jsonPlayGameFactory.abi,
		jsonPlayGameFactory.bytecode,
		signer
	)
	const contract = await factory.deploy(
	)
	await contract.deployed()
	return contract
}

export const createContractTrading = async (
	_gameManager : {address : string},
	signer: ethers.Signer
) => {
	const factory = new ethers.ContractFactory(
		jsonTrading.abi,
		jsonTrading.bytecode,
		signer
	)
	const contract = await factory.deploy(
		_gameManager.address,
	)
	await contract.deployed()
	return contract
}

export const createContractPlayActionLib = async (
	signer: ethers.Signer
) => {
	const factory = new ethers.ContractFactory(
		jsonPlayActionLib.abi,
		jsonPlayActionLib.bytecode,
		signer
	)
	const contract = await factory.deploy(
	)
	await contract.deployed()
	return contract
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
	_playGameFactory : {address : string},
	_playActionLib : {address : string},
	transactionManager: TransactionManager
) => {
	const factory = new ethers.ContractFactory(
		jsonGameManager.abi,
		jsonGameManager.bytecode,
	)
	const utx = factory.getDeployTransaction(
		_playGameFactory.address,
		_playActionLib.address,
	)
	return new ContractGameManager(await transactionManager.sendContractTx(
		utx,
		getContractGameManager,
		 'Create contract GameManager',
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
	transactionManager: TransactionManager
) => {
	const factory = new ethers.ContractFactory(
		jsonPlayGameFactory.abi,
		jsonPlayGameFactory.bytecode,
	)
	const utx = factory.getDeployTransaction(
	)
	return new ContractPlayGameFactory(await transactionManager.sendContractTx(
		utx,
		getContractPlayGameFactory,
		 'Create contract PlayGameFactory',
	), transactionManager)
}

export const createWithManagerContractTrading = async (
	_gameManager : {address : string},
	transactionManager: TransactionManager
) => {
	const factory = new ethers.ContractFactory(
		jsonTrading.abi,
		jsonTrading.bytecode,
	)
	const utx = factory.getDeployTransaction(
		_gameManager.address,
	)
	return new ContractTrading(await transactionManager.sendContractTx(
		utx,
		getContractTrading,
		 'Create contract Trading',
	), transactionManager)
}

export const createWithManagerContractPlayActionLib = async (
	transactionManager: TransactionManager
) => {
	const factory = new ethers.ContractFactory(
		jsonPlayActionLib.abi,
		jsonPlayActionLib.bytecode,
	)
	const utx = factory.getDeployTransaction(
	)
	return new ContractPlayActionLib(await transactionManager.sendContractTx(
		utx,
		getContractPlayActionLib,
		 'Create contract PlayActionLib',
	), transactionManager)
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
export const getHashContractAnimalDominance = (
) => {
	return ethers.utils.id(JSON.stringify(jsonAnimalDominance))
}

export const getHashContractGameManager = (
) => {
	return ethers.utils.id(JSON.stringify(jsonGameManager))
}

export const getHashContractPlayGame = (
) => {
	return ethers.utils.id(JSON.stringify(jsonPlayGame))
}

export const getHashContractPlayGameFactory = (
) => {
	return ethers.utils.id(JSON.stringify(jsonPlayGameFactory))
}

export const getHashContractTrading = (
) => {
	return ethers.utils.id(JSON.stringify(jsonTrading))
}

export const getHashContractPlayActionLib = (
) => {
	return ethers.utils.id(JSON.stringify(jsonPlayActionLib))
}


