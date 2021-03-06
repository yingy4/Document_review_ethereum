import web3 from './web3';
import Document from './build/Document.json';

const address = '0x176A68e0c6e3A522862EF2abAA986485EaeAF71C';

const abi = JSON.parse(Document.interface);

export default new web3.eth.Contract(abi, address);

/*
Deploy contract from account: 0x2656c05b78a855138b3511Ee46b8Bab15ED7019e
Init Document: Hello World!
Init Document Hashing: 3ea2f1d0abf3fc66cf29eebb70cbd4e7fe762ef8a09bcc06c8edf641230afec0
Deploy contract to address: 0x176A68e0c6e3A522862EF2abAA986485EaeAF71C
*/
