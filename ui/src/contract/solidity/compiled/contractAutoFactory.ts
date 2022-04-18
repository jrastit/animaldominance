import { ethers } from 'ethers'
import { TransactionManager } from '../../../util/TransactionManager'

import jsonCardAdmin from './CardAdmin.json'

export const createContractCardAdmin = async (
	signer: ethers.Signer
) => {
	const factory = new ethers.ContractFactory(
		jsonCardAdmin.abi,
		jsonCardAdmin.bytecode,
		signer
	)
	const contract = await factory.deploy(
	)
	await contract.deployed()
	return contract
}


export const createWithManagerContractCardAdmin = async (
	transactionManager: TransactionManager
) => {
	const factory = new ethers.ContractFactory(
		jsonCardAdmin.abi,
		jsonCardAdmin.bytecode,
	)
	const utx = factory.getDeployTransaction(
	)
	return await transactionManager.sendContractTx(
		utx,
		getContractCardAdmin,
		 'Create contract CardAdmin',
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


