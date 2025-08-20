// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.26;

interface Deployed {
	function store(uint256 num) external;
	function retrieve() external view returns (uint256);
}

contract Existing {
	Deployed dc;

	function attach(address _addr) public {
		dc = Deployed(_addr);
	}

	function getA() public view returns (uint result) {
		return dc.retrieve();
	}

    function setA(uint _val) public returns (uint result){
	    dc.store(_val);
	    return _val;
    }
}
