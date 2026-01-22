//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IERC721 {
    function transferFrom(
        address _from,
        address _to,
        uint256 _id
    ) external;
}

contract Escrow {
    address public nftAddress;
    address payable public seller;
    address public inspector;
    address public lender;

    modifier onlyBuyer(uint256 _nftID) {
        require(msg.sender == buyer[_nftID], "Only buyer can call this method");
        _;
    }

    modifier onlySeller() {
        require(msg.sender == seller, "Only seller can call this method");
        _;
    }

    modifier onlyInspector() {
        require(msg.sender == inspector, "Only inspector can call this method");
        _;
    }

   modifier onlyAuthorized(uint256 _nftID) {
    require(
        msg.sender == buyer[_nftID] || 
        msg.sender == seller || 
        msg.sender == inspector || 
        msg.sender == lender,
        "Not authorized"
    );
    _;
}

    mapping(uint256 => bool) public isListed;
    mapping(uint256 => uint256) public purchasePrice;
    mapping(uint256 => uint256) public escrowAmount;
    mapping(uint256 => address) public buyer;
    mapping(uint256 => bool) public inspectionPassed;
    mapping(uint256 => mapping(address => bool)) public approval;

    // Escrow lifecycle events
event NFTListed(
    uint256 indexed nftID,
    address indexed seller,
    address indexed buyer,
    uint256 purchasePrice,
    uint256 escrowAmount
);

event EarnestDeposited(
    uint256 indexed nftID,
    address indexed buyer,
    uint256 amount,
    uint256 totalBalance
);

event InspectionUpdated(
    uint256 indexed nftID,
    address indexed inspector,
    bool passed,
    string reason
);

event SaleApproved(
    uint256 indexed nftID,
    address indexed approver
);

event SaleFinalized(
    uint256 indexed nftID,
    address indexed seller,
    address indexed buyer,
    uint256 purchasePrice,
    uint256 sellerReceived
);

event SaleCancelled(
    uint256 indexed nftID,
    address indexed cancelledBy,
    address refundTo,
    uint256 refundAmount,
    string reason
);

event FundsReceived(
    address indexed from,
    uint256 amount,
    uint256 newBalance
);

    constructor(
        address _nftAddress,
        address payable _seller,
        address _inspector,
        address _lender
    ) {
        nftAddress = _nftAddress;
        seller = _seller;
        inspector = _inspector;
        lender = _lender;
    }

    function list(
        uint256 _nftID,
        address _buyer,
        uint256 _purchasePrice,
        uint256 _escrowAmount
    ) public payable onlySeller {
        // Transfer NFT from seller to this contract
        IERC721(nftAddress).transferFrom(msg.sender, address(this), _nftID);

        isListed[_nftID] = true;
        purchasePrice[_nftID] = _purchasePrice;
        escrowAmount[_nftID] = _escrowAmount;
        buyer[_nftID] = _buyer;
         emit NFTListed(_nftID, msg.sender, _buyer, _purchasePrice, _escrowAmount);
    }

    // Put Under Contract (only buyer - payable escrow)
    function depositEarnest(uint256 _nftID) public payable onlyBuyer(_nftID) {
        require(msg.value >= escrowAmount[_nftID]);
        emit EarnestDeposited(_nftID, msg.sender, msg.value, address(this).balance);
    }

    // Update Inspection Status (only inspector)
    function updateInspectionStatus(uint256 _nftID, bool _passed)
        public
        onlyInspector
    {
        inspectionPassed[_nftID] = _passed;
        string memory reason = _passed ? "Inspection passed" : "Inspection failed";
    emit InspectionUpdated(_nftID, msg.sender, _passed, reason);
    }

    // Approve Sale
    function approveSale(uint256 _nftID) public {
        approval[_nftID][msg.sender] = true;
          emit SaleApproved(_nftID, msg.sender);
    }

    // Finalize Sale
    // -> Require inspection status (add more items here, like appraisal)
    // -> Require sale to be authorized
    // -> Require funds to be correct amount
    // -> Transfer NFT to buyer
    // -> Transfer Funds to Seller
    function finalizeSale(uint256 _nftID) public onlyAuthorized(_nftID) {
        require(inspectionPassed[_nftID]);
        require(approval[_nftID][buyer[_nftID]]);
        require(approval[_nftID][seller]);
        require(approval[_nftID][lender]);
        require(address(this).balance >= purchasePrice[_nftID]);

        isListed[_nftID] = false;

        (bool success, ) = payable(seller).call{value: address(this).balance}(
            ""
        );
        require(success);

        IERC721(nftAddress).transferFrom(address(this), buyer[_nftID], _nftID);
         emit SaleFinalized(_nftID, seller, buyer[_nftID], purchasePrice[_nftID], balance);
    }

    // Cancel Sale (handle earnest deposit)
    // -> if inspection status is not approved, then refund, otherwise send to seller
    function cancelSale(uint256 _nftID) public {
        if (inspectionPassed[_nftID] == false) {
            payable(buyer[_nftID]).transfer(address(this).balance);
        } else {
            payable(seller).transfer(address(this).balance);
        }
      emit SaleCancelled(_nftID, msg.sender, refundTo, balance, reason);
    }

    receive() external payable {
emit FundsReceived(msg.sender, msg.value, address(this).balance);
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}
