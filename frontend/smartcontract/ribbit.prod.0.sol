pragma solidity ^0.4.0;
// https://medium.com/daox/three-methods-to-transfer-funds-in-ethereum-by-means-of-solidity-5719944ed6e9

contract Ribbit {
    address public owner;
    address public previousContractAddress; 
    /**
     * 0x0 => earnings
     * 0x1 => likes 
     * 0x2 => dislikes
     * 0x3 => reports
     * 0x4 => comments
     * 0x5 => reposts
     * 
     * transactionHash => field => value
     */
    mapping (bytes32 => mapping(uint => uint)) public state;   // transactionHash
    mapping (address => string) public metaDataJSONStringMap;  
    
    /**
     * uint[2] here 
     *     [0] => block.number
     *     [1] => hash (sha256 hash)
     */
    mapping (address => uint[2]) public currentFeedInfoMap;
    mapping (bytes32 => uint[2]) public currentCommentInfoMap;
    mapping (bytes32 => uint[2]) public currentTagInfoByTimeMap;
    mapping (bytes32 => uint[2]) public currentTagInfoByTrendMap;

    constructor(address previousContractAddr) public {
        owner = msg.sender;
        previousContractAddress = previousContractAddr;
    }
    /*
    // These two functions are not safe
    function updateState(bytes32 transactionHash, uint field, uint value) external {
        state[transactionHash][field] = state[transactionHash][field] + value;
    }
    function multipleState(bytes32 transactionHash, uint[] fieldsAndValues) external {
        for (uint i = 0; i < fieldsAndValues.length; i += 2) {
            state[transactionHash][fieldsAndValues[i]] = state[transactionHash][fieldsAndValues[i]] + fieldsAndValues[i+1];
        }
    }
    function increaseStateFieldsByOne(bytes32 transactionHash, uint[] fields) external {
        for (uint i = 0; i < fields.length; i++) {
            uint field = fields[i];
            state[transactionHash][field] = state[transactionHash][field] + 1;
        } 
    }
    */
    function getState(bytes32 transactionHash, uint field) external constant returns (uint)  {
        return state[transactionHash][field];
    }
    function setMetaDataJSONStringMap(string value) external {
        metaDataJSONStringMap[msg.sender] = value;
    }
    function getMetaDataJSONStringValue(address addr) external constant returns (string) {
        return metaDataJSONStringMap[addr];
    }
    function getCurrentFeedInfo(address authorAddress) external constant returns (uint[2]) {
        return currentFeedInfoMap[authorAddress];
    }
    function getCurrentTagInfoByTime(bytes32 tag) external constant returns (uint[2]) {
        return currentTagInfoByTimeMap[tag];
    }
    function getCurrentTagInfoByTrend(bytes32 tag) external constant returns (uint[2]) {
        return currentTagInfoByTrendMap[tag];
    }
    function getCurrentCommentInfo(bytes32 parentTransactionHash) external constant returns (uint[2]) {
        return currentCommentInfoMap[parentTransactionHash];
    }
    
    // Post Feed 
    event PostEvent(uint[2] previousFeedTransactionInfo);
    event SavePreviousTagInfoByTimeEvent(bytes32 tag, uint[2] previousTagInfoByTime);
    event SavePreviousTagInfoByTrendEvent(bytes32 tag, uint[2] previousTagInfoByTrend);
    function post(uint version, uint timestamp, string message, uint messageHash, bytes32 previousFeedTransactionHash, bytes32[] tags) external {
        emit PostEvent(currentFeedInfoMap[msg.sender]);
        uint blockNumber = block.number;
        currentFeedInfoMap[msg.sender][0] = blockNumber;
        currentFeedInfoMap[msg.sender][1] = messageHash;

        bytes32 tag;
        for (uint i = 0; i < tags.length; i++) {
            tag = tags[i];
            emit SavePreviousTagInfoByTimeEvent(tag, currentTagInfoByTimeMap[tag]);
            currentTagInfoByTimeMap[tag][0] = blockNumber;
            currentTagInfoByTimeMap[tag][1] = messageHash;
            
            emit SavePreviousTagInfoByTrendEvent(tag, currentTagInfoByTrendMap[tag]);
            currentTagInfoByTrendMap[tag][0] = blockNumber;
            currentTagInfoByTrendMap[tag][1] = messageHash;
        }
    }

    // Repost Feed
    event RepostEvent(uint[2] previousFeedTransactionInfo);
    function repost(uint version, uint timestamp, bytes32 parentTransactionHash, uint parentTransactionBlockNumber, uint parentTransactionMessageHash, bytes32 previousFeedTransactionHash, bytes32[] tags) external {
        emit RepostEvent(currentFeedInfoMap[msg.sender]);
        // We can see the sender of feedInfo is not from msg.sender
        // So this is a repost.
        currentFeedInfoMap[msg.sender][0] = parentTransactionBlockNumber;
        currentFeedInfoMap[msg.sender][1] = parentTransactionMessageHash;
        state[parentTransactionHash][5] = state[parentTransactionHash][5] + 1; // increase number of reposts.

        bytes32 tag;
        for (uint i = 0; i < tags.length; i++) {
            tag = tags[i];
            if (currentTagInfoByTrendMap[tag][1] != parentTransactionMessageHash) { // not the same post.  
                emit SavePreviousTagInfoByTrendEvent(tag, currentTagInfoByTrendMap[tag]);
                currentTagInfoByTrendMap[tag][0] = parentTransactionBlockNumber;
                currentTagInfoByTrendMap[tag][1] = parentTransactionMessageHash;
            }
        }
    }
    
    // Make comment
    event CommentEvent(uint[2] previousCommentInfo);
    function comment(uint version, uint timestamp, bytes32 parentTransactionHash, uint parentTransactionBlockNumber, uint parentTransactionMessageHash, string message, uint messageHash, bytes32 previousCommentTransactionHash, bytes32[] tags) external {
        emit CommentEvent(currentCommentInfoMap[parentTransactionHash]);
        currentCommentInfoMap[parentTransactionHash][0] = block.number;   
        currentCommentInfoMap[parentTransactionHash][1] = messageHash;
        state[parentTransactionHash][4] = state[parentTransactionHash][4] + 1; // increase number of comments
        
        bytes32 tag;
        for (uint i = 0; i < tags.length; i++) {
            tag = tags[i];
            if (currentTagInfoByTrendMap[tag][1] != parentTransactionMessageHash) { // not the same post.  
                emit SavePreviousTagInfoByTrendEvent(tag, currentTagInfoByTrendMap[tag]);
                currentTagInfoByTrendMap[tag][0] = parentTransactionBlockNumber;
                currentTagInfoByTrendMap[tag][1] = parentTransactionMessageHash;
            }
        }
    }

    // Repost and Comment
    event RepostAndCommentEvent(uint[2] previousFeedTransactionInfo, uint[2] previousCommentInfo);
    function repostAndComment(uint version, uint timestamp, bytes32 parentTransactionHash, uint parentTransactionBlockNumber, uint parentTransactionMessageHash, string message, uint messageHash, bytes32 previousCommentTransactionHash, bytes32[] tags) external {
        emit RepostAndCommentEvent(currentFeedInfoMap[msg.sender], currentCommentInfoMap[parentTransactionHash]);
        uint blockNumber = block.number;
        
        currentCommentInfoMap[parentTransactionHash][0] = blockNumber;   
        currentCommentInfoMap[parentTransactionHash][1] = messageHash;
        state[parentTransactionHash][4] = state[parentTransactionHash][4] + 1; // increase number of comments
    
        currentFeedInfoMap[msg.sender][0] = blockNumber;
        currentFeedInfoMap[msg.sender][1] = messageHash;
        state[parentTransactionHash][5] = state[parentTransactionHash][5] + 1; // increase number of reposts.

        bytes32 tag;
        for (uint i = 0; i < tags.length; i++) {
            tag = tags[i];
            if (currentTagInfoByTrendMap[tag][1] != parentTransactionMessageHash) { // not the same post.  
                emit SavePreviousTagInfoByTrendEvent(tag, currentTagInfoByTrendMap[tag]);
                currentTagInfoByTrendMap[tag][0] = parentTransactionBlockNumber;
                currentTagInfoByTrendMap[tag][1] = parentTransactionMessageHash;
            }
        }
    }

    // Send ether 
    function sendEther(bytes32 transactionHash, address postAutherAddress, uint amount1, address appAuthorAddress, uint amount2) payable external {
        state[transactionHash][0] = state[transactionHash][0] + amount1 + amount2;
        if (amount1 > 0) {
            postAutherAddress.transfer(amount1);
        }
        if (amount2 > 0) {
            appAuthorAddress.transfer(amount2);
        }
    }

    // Like
    function like(bytes32 transactionHash) external {
        state[transactionHash][1] = state[transactionHash][1] + 1;
    }

    // Dislike
    function dislike(bytes32 transactionHash) external {
        state[transactionHash][2] = state[transactionHash][2] + 1;
    }

    // Report
    function report(bytes32 transactionHash) external {
        state[transactionHash][3] = state[transactionHash][3] + 1;
    }
}