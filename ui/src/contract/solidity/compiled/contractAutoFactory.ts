import { ethers } from 'ethers'
import { TransactionManager } from '../../../util/TransactionManager'
import { ContractGeneric, initContract, ContractFunction } from '../../../util/ContractGeneric'

import jsonAnimalDominance from './AnimalDominance.json'
import jsonGameManager from './GameManager.json'
import jsonPlayGame from './PlayGame.json'
import jsonPlayGameFactory from './PlayGameFactory.json'
import jsonTrading from './Trading.json'
import jsonPlayActionLib from './PlayActionLib.json'
import jsonPlayBot from './PlayBot.json'

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

export class ContractPlayBot extends ContractGeneric {
	readonly [key: string]: ContractFunction | any
	constructor(contract: ethers.Contract, transactionManager: TransactionManager) {
		super(contract, transactionManager)
		initContract(this, jsonPlayBot.abi)
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
	signer: ethers.Signer
) => {
	const factory = new ethers.ContractFactory(
		jsonPlayBot.abi,
		jsonPlayBot.bytecode,
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
	transactionManager: TransactionManager
) => {
	const factory = new ethers.ContractFactory(
		jsonPlayBot.abi,
		jsonPlayBot.bytecode,
	)
	const utx = factory.getDeployTransaction(
	)
	return new ContractPlayBot(await transactionManager.sendContractTx(
		utx,
		getContractPlayBot,
		 'Create contract PlayBot',
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
export const getHashContractAnimalDominance = (
) => {
	return ethers.BigNumber.from('0x8cb3544c3bb4431ab56e60b4631858802a6e4d793539d2d9ea89ad0f2b19bf24') 
}

export const getHashContractGameManager = (
) => {
	return ethers.BigNumber.from('0xe9801b67f53d43b5f8b12f18817438f44a1b84c1bd68e5c42606f59d2e9339f7') 
}

export const getHashContractPlayGame = (
) => {
	return ethers.BigNumber.from('0x357ca70c1a4a8205e60cee4e50cc6dc59123fab0ef4cad6a1be51c83c6b24316') 
}

export const getHashContractPlayGameFactory = (
) => {
	return ethers.BigNumber.from('0xab42fccd57d0f930f0b92798a64be3d3bc15bc1ce0d934d5505795887dab9673') 
}

export const getHashContractTrading = (
) => {
	return ethers.BigNumber.from('0x67649f2ac0ea44733fd52fd2866524a03bb3108aa06d8b0bd4db8053e974699a') 
}

export const getHashContractPlayActionLib = (
) => {
	return ethers.BigNumber.from('0x5f834f988394bffbd3311c9527d040adcb604f19e9937ef59eba94b0ba778b6a') 
}

export const getHashContractPlayBot = (
) => {
	return ethers.BigNumber.from('0x8c4346c524dbe93193e0af9ea1d9936af37467b6eb714bfbcf750367a906c387') 
}


