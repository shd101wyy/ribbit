pragma solidity ^0.4.0;
// https://medium.com/daox/three-methods-to-transfer-funds-in-ethereum-by-means-of-solidity-5719944ed6e9

contract Ribbit {
    address owner;
    address public previousContractAddress; 
    /**
     * 0x0 => earnings
     * 0x1 => likes 
     * 0x2 => dislikes
     * 0x3 => reports
     * 
     * transactionHash => field => value
     */
    mapping (bytes32 => mapping(uint => uint)) public state;   // transactionHash
    mapping (address => string) public metaDataJSONStringMap;  
    
    /**
     * uint[2] here 
     *     [0] => block.number
     *     [1] => timestamp
     *     [2] => hash (sha256 hash)
     */
    mapping (address => uint[3]) public currentFeedInfoMap;
    mapping (bytes32 => uint[3]) public currentCommentInfoMap;
    mapping (bytes32 => uint[3]) public currentTagInfoByTimeMap;
    mapping (bytes32 => uint[3]) public currentTagInfoByTrendMap;

    function Decent(address previousContractAddr) public {
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
    */
    function getState(bytes32 transactionHash, uint field) external constant returns (uint)  {
        return state[transactionHash][field];
    }
    function increaseStateFieldsByOne(bytes32 transactionHash, uint[] fields) external {
        for (uint i = 0; i < fields.length; i++) {
            uint field = fields[i];
            state[transactionHash][field] = state[transactionHash][field] + 1;
        } 
    }
    function setMetaDataJSONStringMap(string value) external {
        metaDataJSONStringMap[msg.sender] = value;
    }
    function getMetaDataJSONStringValue(address addr) external constant returns (string) {
        return metaDataJSONStringMap[addr];
    }
    
    // Post Feeds 
    event PostFeedEvent(uint version, uint timestamp, string message, uint messageHash, bytes32 previousFeedTransactionHash, uint[3] previousFeedTransaction);
    event PostTagByTimeEvent(bytes32 tag, bytes32 previousTagTransactionHash, uint[3] previousTagTransaction);
    event PostTagByTrendEvent(bytes32 tag, bytes32 previousTagTransactionHash, uint[3] previousTagTransaction);
    function postFeed(uint version, uint timestamp, string message, uint messageHash, bytes32 previousFeedTransactionHash, bytes32[] tags, bytes32[] previousTagTransactionByTimeHashes, bytes32[] previousTagTransactionByTrendHashes) external {
        emit PostFeedEvent(version, timestamp, message, messageHash, previousFeedTransactionHash, currentFeedInfoMap[msg.sender]);
        uint blockNumber = block.number;
        currentFeedInfoMap[msg.sender][0] = blockNumber;
        currentFeedInfoMap[msg.sender][1] = timestamp;
        currentFeedInfoMap[msg.sender][2] = messageHash;
        for (uint i = 0; i < tags.length; i++) {
            emit PostTagByTimeEvent(tags[i], previousTagTransactionByTimeHashes[i], currentTagInfoByTimeMap[tags[i]]);
            currentTagInfoByTimeMap[tags[i]][0] = blockNumber;
            currentTagInfoByTimeMap[tags[1]][1] = timestamp;
            
            emit PostTagByTrendEvent(tags[i], previousTagTransactionByTrendHashes[i], currentTagInfoByTrendMap[tags[i]]);
            currentTagInfoByTrendMap[tags[i]][0] = blockNumber;
            currentTagInfoByTimeMap[tags[i]][1] = timestamp;
        }
    }
    function getCurrentFeedInfo(address authorAddress) external constant returns (uint[3]) {
        return currentFeedInfoMap[authorAddress];
    }
    function getCurrentTagInfoByTime(bytes32 tag) external constant returns (uint[3]) {
        return currentTagInfoByTimeMap[tag];
    }
    function getCurrentTagInfoByTrend(bytes32 tag) external constant returns (uint[3]) {
        return currentTagInfoByTrendMap[tag];
    }
    function getCurrentCommentInfo(bytes32 parentTransactionHash) external constant returns (uint[3]) {
        return currentCommentInfoMap[parentTransactionHash];
    }
    
    // Post Comments
    event PostCommentEvent(uint version, uint timestamp, bytes32 parentTransactionHash, string message, uint messageHash, bytes32 previousCommentTransactionHash);
    function postComment(uint version, uint timestamp, bytes32 parentTransactionHash, uint parentTransactionBlockNumber, string message, uint messageHash, bytes32 previousCommentTransactionHash, bytes32[] tags, bytes32[] previousTagTransactionByTrendHashes) external {
        emit PostCommentEvent(version, timestamp, parentTransactionHash, message, messageHash, previousCommentTransactionHash);
        currentCommentInfoMap[parentTransactionHash][0] = block.number;   
        currentCommentInfoMap[parentTransactionHash][1] = timestamp;    
        currentCommentInfoMap[parentTransactionHash][2] = messageHash;
        for (uint i = 0; i < tags.length; i++) {
            emit PostTagByTrendEvent(tags[i], previousTagTransactionByTrendHashes[i], currentTagInfoByTrendMap[tags[i]]);
            currentTagInfoByTrendMap[tags[i]][0] = parentTransactionBlockNumber;
            currentTagInfoByTrendMap[tags[i]][1] = timestamp;
        }
    }
    
    // Send ether 
    function sendEther(bytes32 transactionHash, address postAutherAddress, uint amount1, address appAuthorAddress, uint amount2) payable external {
        state[transactionHash][0x0] = state[transactionHash][0x0] + amount1;
        if (amount1 > 0) {
            postAutherAddress.transfer(amount1);
        }
        if (amount2 > 0) {
            appAuthorAddress.transfer(amount2);
        }
    }
}