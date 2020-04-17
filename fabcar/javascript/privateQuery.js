/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const {
    Gateway,
    Wallets
} = require('fabric-network');
const path = require('path');
const fs = require('fs');


async function main() {
    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get('appUser');
        if (!identity) {
            console.log('An identity for the user "appUser" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet,
            identity: 'admin',
            discovery: {
                enabled: true,
                asLocalhost: true
            }
        });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('marbles02_private')
        // Get the contract from the network.
        // Variant of Transaction abstraction with everything as setters
        // const transaction = contract.createTransaction('transferMarble');
       
        // const data =  "{\"name\":\"marble1\",\"owner\":\"Quan\"}"
        // const transientMap = {
        //     marble_owner: Buffer.from(data)
        // };
        // transaction.setTransient(transientMap);
        // const response = await transaction.submit();
        // console.log(`Transaction has been evaluated, result is: ${response.toString()}`);
        const result = await contract.evaluateTransaction('readMarble','marble1');
        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);

    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        process.exit(1);
    }
}

main();
