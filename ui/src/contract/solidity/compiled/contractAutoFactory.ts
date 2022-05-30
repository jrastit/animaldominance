import { ethers } from 'ethers'
import { TransactionManager } from '../../../util/TransactionManager'
import { ContractGeneric, initContract, ContractFunction } from '../../../util/ContractGeneric'

import jsonCardAdmin from './CardAdmin.json'
import jsonPlayGame from './PlayGame.json'
import jsonPlayGameFactory from './PlayGameFactory.json'
import jsonTrading from './Trading.json'

export class ContractCardAdmin extends ContractGeneric {
	readonly [key: string]: ContractFunction | any
	constructor(contract: ethers.Contract, transactionManager: TransactionManager) {
		super(contract, transactionManager)
		initContract(this, jsonCardAdmin.abi)
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


export const createContractCardAdmin = async (
	_playGameFactory : {address : string},
	signer: ethers.Signer
) => {
	const factory = new ethers.ContractFactory(
		jsonCardAdmin.abi,
		jsonCardAdmin.bytecode,
		signer
	)
	const contract = await factory.deploy(
		_playGameFactory.address,
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
	_cardAdmin : {address : string},
	signer: ethers.Signer
) => {
	const factory = new ethers.ContractFactory(
		jsonTrading.abi,
		jsonTrading.bytecode,
		signer
	)
	const contract = await factory.deploy(
		_cardAdmin.address,
	)
	await contract.deployed()
	return contract
}


export const createWithManagerContractCardAdmin = async (
	_playGameFactory : {address : string},
	transactionManager: TransactionManager
) => {
	const factory = new ethers.ContractFactory(
		jsonCardAdmin.abi,
		jsonCardAdmin.bytecode,
	)
	const utx = factory.getDeployTransaction(
		_playGameFactory.address,
	)
	return new ContractCardAdmin(await transactionManager.sendContractTx(
		utx,
		getContractCardAdmin,
		 'Create contract CardAdmin',
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
	_cardAdmin : {address : string},
	transactionManager: TransactionManager
) => {
	const factory = new ethers.ContractFactory(
		jsonTrading.abi,
		jsonTrading.bytecode,
	)
	const utx = factory.getDeployTransaction(
		_cardAdmin.address,
	)
	return new ContractTrading(await transactionManager.sendContractTx(
		utx,
		getContractTrading,
		 'Create contract Trading',
	), transactionManager)
}


export const getContractCardAdmin = (
	contractAddress: string,
	signer: ethers.Signer,
) => {
	return new ethers.Contract(
		contractAddress,
		jsonCardAdmin.abi,
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


export const getWithManagerContractCardAdmin = (
	contractAddress: string,
	transactionManager: TransactionManager
) => {
	return new ContractCardAdmin(new ethers.Contract(
		contractAddress,
		jsonCardAdmin.abi,
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


