const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const provider = ganache.provider();
const web3 = new Web3(provider);

const compiledDocument = require('../src/build/Document.json');

let accts;
let document;

beforeEach(async ()=>{
    //get a list of all accout
    accts = await web3.eth.getAccounts();
    //use one account to deploy inbox
    document = await new web3.eth.Contract(JSON.parse(compiledDocument.interface))
        .deploy({ data: compiledDocument.bytecode, arguments: ['ABCDEFG'] })
        .send({ from: accts[0], gas: '1000000' });

    document.setProvider(provider);
});

describe('Document', () => {
    it('deploy a contract',() => {
        assert.ok(document.options.address);
    });

    it('contains init docHash',async () => {
        const initDocHash = await document.methods.docHash().call();
        assert.equal(initDocHash, 'ABCDEFG');
    });

    it('can review by owner',async () => {
        await document.methods.review('XYZ').send({ from: accts[0]});
        const myReview = await document.methods.getMyReview().call();
        assert.equal(myReview, 'XYZ');
    });

    it('can review by other account',async () => {
        await document.methods.review('IJK').send({ from: accts[1]});
        const myReview = await document.methods.getMyReview().call({ from: accts[1]});
        assert.equal(myReview, 'IJK');
    });

    it('owner is allow to disable/enable review',async () => {
        await document.methods.disableReview().send({ from: accts[0]});
        var reviewable = await document.methods.reviewable().call();
        assert.equal(reviewable, false);
        await document.methods.enableReview().send({ from: accts[0]});
        reviewable = await document.methods.reviewable().call();
        assert.equal(reviewable, true);
    });

    it('non-owner is not allow to disable review',async () => {
        try {
            await document.methods.disableReview().send({from: accts[1]});
            assert.fail();
        } catch(error) { //it should catch a error
            const reviewable = await document.methods.reviewable().call();
            assert.equal(reviewable, true);
        }
    });

    it('non-owner is not allow to enable review',async () => {
        await document.methods.disableReview().send({ from: accts[0]});
        try {
            await document.methods.enableReview().send({from: accts[1]});
            assert.fail();
        } catch(error) { //it should catch a error
            const reviewable = await document.methods.reviewable().call();
            assert.equal(reviewable, false);
        }
    });

    it('should reject new review after disable review',async () => {
        await document.methods.review('XYZ').send({ from: accts[0]});
        await document.methods.disableReview().send({ from: accts[0]});
        try {
            await document.methods.review('ABC').send({from: accts[0]});
            assert.fail();
        } catch(error) { //it should catch a error
            const myReview = await document.methods.getMyReview().call();
            assert.equal(myReview, 'XYZ'); //review should not change
        }
    });

    it('should return right size of reviews',async () => {
        await document.methods.review('XYZ').send({ from: accts[0]});
        await document.methods.review('OPQ').send({ from: accts[1]});
        const reviewSize = await document.methods.getReviewSize().call();
        assert.equal(reviewSize, 2);
    });

    it('new review should replace previous one',async () => {
        await document.methods.review('XYZ').send({ from: accts[0]});
        var reviewHash = await document.methods.getMyReview().call();
        assert.equal(reviewHash, 'XYZ');
        await document.methods.review('OPQ').send({ from: accts[0]});
        reviewHash = await document.methods.getMyReview().call();
        assert.equal(reviewHash, 'OPQ');
        const reviewSize = await document.methods.getReviewSize().call();
        assert.equal(reviewSize, 1);
    });

    it('should get reviewHash by index',async () => {
        await document.methods.review('XYZ').send({ from: accts[0]});
        await document.methods.review('OPQ').send({ from: accts[1]});
        const review1 = await document.methods.getReviewByIndex(0).call();
        assert.equal(review1, 'XYZ');
        const review2 = await document.methods.getReviewByIndex(1).call();
        assert.equal(review2, 'OPQ');
    });

    it('should get reviewHash by address',async () => {
        await document.methods.review('XYZ').send({ from: accts[0]});
        await document.methods.review('OPQ').send({ from: accts[1]});
        const review1 = await document.methods.getReviewByAddress(accts[0]).call();
        assert.equal(review1, 'XYZ');
        const review2 = await document.methods.getReviewByAddress(accts[1]).call();
        assert.equal(review2, 'OPQ');
    });

    it('should get all reviewers addresses',async () => {
        await document.methods.review('XYZ').send({ from: accts[0]});
        await document.methods.review('OPQ').send({ from: accts[1]});
        const reviewers = await document.methods.getReviewers().call();
        assert.equal(reviewers.length, 2);
        assert.equal(reviewers[0], accts[0]);
        assert.equal(reviewers[1], accts[1]);
    });

});