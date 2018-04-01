import React, { Component } from 'react';
import './App.css';
import web3 from './web3';
import document from './document';
import createKeccakHash from 'keccak';

class App extends Component {
    state = {
        owner: '',
        docHash: '',
        address: '',
        reviewNumber: '',
        reviewMessage: '',
        message: '',
        doc: 'Hello World!',
        isDocVerify: ''
    };


    async componentDidMount() {
        const owner = await document.methods.owner().call();
        const docHash = await document.methods.docHash().call();
        const reviewNumber = await document.methods.getReviewSize().call();
        const docHashLocal = createKeccakHash('keccak256').update(this.state.doc).digest('hex');
        console.log('docHashLocal:'+docHashLocal);
        const docHashEth = await document.methods.docHash().call();
        console.log('docHashEth:'+docHashEth);
        const isDocVerify = (docHashLocal === docHashEth).toString();
        this.setState({ owner, docHash, reviewNumber, isDocVerify });

    }

    onSubmitReview = async (event) => {
        event.preventDefault();
        const accts = await web3.eth.getAccounts();
        this.setState({ message: 'Waiting for transaction success...'});
        const reviewHash = createKeccakHash('keccak256').update(this.state.reviewMessage).digest('hex');
        await document.methods.review(reviewHash).send({ from: accts[0] });
        this.setState({ message: 'You successfully submit a review!'});
    };

    onChangeVerifyDoc = async (event) => {
        event.preventDefault();
        this.setState({ doc: event.target.value});
        const docHashLocal = createKeccakHash('keccak256').update(event.target.value).digest('hex');
        console.log('docHashLocal:'+docHashLocal);
        const docHashEth = await document.methods.docHash().call();
        console.log('docHashEth:'+docHashEth);
        this.setState({ isDocVerify: (docHashLocal === docHashEth).toString()});
    };


  render() {
    return (
        <div>
            <h2>Document Contract</h2>
            <p>This is document's owner is {this.state.owner}</p>
            <p>This is document's content is Hello World!</p>
            <p>This is document's docHash is {this.state.docHash}</p>
            <p>This is document has {this.state.reviewNumber} reviews.</p>
            <hr/>

            <h4>Document:</h4>
            <div>
                <label>Text:</label>
                <input
                    value={this.state.doc}
                    onChange={this.onChangeVerifyDoc}
                />
                <p>Your document is {this.state.isDocVerify}.</p>
            </div>

            <hr/>

            <form onSubmit={this.onSubmitReview}>
                <h4>Post a review:</h4>
                <div>
                    <label>Text:</label>
                    <input
                        value={this.state.reviewMessage}
                        onChange={event => this.setState({ reviewMessage: event.target.value})}
                    />
                </div>
                <button>Post</button>
            </form>
            <hr/>
            <h1>{this.state.message}</h1>
        </div>
    );
  }
}

export default App;
