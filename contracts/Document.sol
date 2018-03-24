pragma solidity^0.4.17;

contract Document {

    address public owner; //owner of the article
    mapping(address => string) reviews; //the map hold all the review hash by address
    address[] public reviewers; //all reviewers
    string public docHash; //the hash for document
    bool public reviewable; //flag for accept review or not

    //Constructor for this contract, take one argument initDocHash of the document
    function Document(string initDocHash) public {
        owner = msg.sender;
        docHash = initDocHash;
        reviewable = true;
    }

    //disableReview, only called by owner
    function disableReview() public onlyOwner {
        reviewable = false;
    }

    //enableReview, only called by owner
    function enableReview() public onlyOwner {
        reviewable = true;
    }

    //review the document, take one argument reviewHash, newer review will replace previous one
    function review(string reviewHash) public canReview {
        require(bytes(reviewHash).length > 0);
        if (bytes(reviews[msg.sender]).length == 0) {
            reviewers.push(msg.sender);
        }
        reviews[msg.sender] = reviewHash;
    }

    //get the reviewHash for caller
    function getMyReview() public view returns (string) {
        return reviews[msg.sender];
    }

    //get the size for all the reviews
    function getReviewSize() public view returns (uint) {
        return reviewers.length;
    }

    //get reviewMessage by address
    function getReviewByAddress(address addr) public view returns (string) {
        return reviews[addr];
    }

    //get reviewMessage by index
    function getReviewByIndex(uint i) public view returns (string) {
        return reviews[reviewers[i]];
    }

    modifier canReview() {
        require(reviewable);
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }
    
}