const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const provider = ganache.provider();
const web3 = new Web3(provider);

const compiledDocuments = require('../build/Documents.json');
const compiledDocument = require('../build/Document.json');

let accts;
let documents;

beforeEach(async ()=>{
    //get a list of all accout
    accts = await web3.eth.getAccounts();
    //use one account to deploy inbox
    documents = await new web3.eth.Contract(JSON.parse(compiledDocuments.interface))
        .deploy({ data: compiledDocuments.bytecode })
        .send({ from: accts[0], gas: '1000000' });

    documents.setProvider(provider);
});

describe('Documents', () => {
    it('deploy a contract',() => {
        assert.ok(documents.options.address);
    });

    it('creates a new document',async () => {
        await documents.methods.createDocument('XYZ').send({ from: accts[0], gas: '1000000' });
        const result = await documents.methods.getPublishedDocuments().call();
        assert.equal(result.length, 1);
        [documentAddress] = result;
        document = await new web3.eth.Contract(
            JSON.parse(compiledDocument.interface),
            documentAddress
        );
        const docHash = await document.methods.docHash().call();
        assert.equal(docHash, 'XYZ');
    });

    it('creates multiple new documents',async () => {
        await documents.methods.createDocument('XYZ').send({ from: accts[0], gas: '1000000' });
        await documents.methods.createDocument('ABC').send({ from: accts[0], gas: '1000000' });
        const result = await documents.methods.getPublishedDocuments().call();
        assert.equal(result.length, 2);
    });

});