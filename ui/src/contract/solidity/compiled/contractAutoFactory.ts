import { ethers } from 'ethers'
import { TransactionManager } from '../../../util/TransactionManager'

import jsonCardAdmin from './CardAdmin.json'
import jsonPlayGameFactory from './PlayGameFactory.json'

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
	return await transactionManager.sendContractTx(
		utx,
		getContractCardAdmin,
		 'Create contract CardAdmin',
	)
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
	return await transactionManager.sendContractTx(
		utx,
		getContractPlayGameFactory,
		 'Create contract PlayGameFactory',
	)
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


