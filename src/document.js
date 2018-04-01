import web3 from './web3';
import Document from './build/Document.json';

const address = '0xC981f3b063e715F6A73e8Cf7A5a7d684873df02d';

const abi = JSON.parse(Document.interface);

export default new web3.eth.Contract(abi, address);

//Deploy contract from account: 0x2656c05b78a855138b3511Ee46b8Bab15ED7019e
//Init Document: Hello World!
//Init Document Hashing: 3ea2f1d0abf3fc66cf29eebb70cbd4e7fe762ef8a09bcc06c8edf641230afec0
//Deploy contract to address: 0xC981f3b063e715F6A73e8Cf7A5a7d684873df02d
