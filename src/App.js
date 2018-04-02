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
        isDocVerify: '',
        reviewers: [],
        reviews: [],
        zipped: [],
        reviewContent: [],
        isReviewVerify: [],
        buttonEnable: true
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
        const reviewers = await document.methods.getReviewers().call();
        console.log('reviewers:'+reviewers);
        const reviews = await Promise.all(reviewers.map(async address => await document.methods.getReviewByAddress(address).call()));
        console.log('reviews:'+reviews);
        const zipped = reviewers.map(function(address, i) {
            return [address, reviews[i]];
        });
        console.log(zipped);
        this.setState({ owner, docHash, reviewNumber, isDocVerify, reviewers, reviews, zipped });

    }

    onSubmitReview = async (event) => {
        event.preventDefault();
        this.setState({ buttonEnable: false });
        const accts = await web3.eth.getAccounts();
        this.setState({ message: 'Waiting for transaction success...'});
        const reviewHash = createKeccakHash('keccak256').update(this.state.reviewMessage).digest('hex');
        await document.methods.review(reviewHash).send({ from: accts[0] });
        this.setState({ message: 'You successfully submit a review!'});
        this.setState({ buttonEnable: true });
        window.location.reload();
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

    renderReviews() {
       return this.state.zipped.map(function(a) {
              return (
                  <React.Fragment>
                  <li key={a[0]}>reviewer address:{a[0]}, reviewHash:{a[1]}</li>
                  </React.Fragment>
              );
            }
        );
    }


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
                <button disabled={!this.state.buttonEnable}>Post</button>
            </form>
            <hr/>

            <h4>All reviews:</h4>
            {this.renderReviews()}

            <hr/>
            <h1>{this.state.message}</h1>


        </div>
    );
  }
}

export default App;
