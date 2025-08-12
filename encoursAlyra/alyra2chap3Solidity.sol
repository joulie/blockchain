// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Partie 1 : Base du contrat
contract MonContrat {
    
    // Partie 2 : Variable d'état
    address public storedAddress;
    constructor() payable{}

    // Fonction pour définir la variable
    function setAddress(address _address) public {
        storedAddress = _address;
    }

    // Partie 3 : Récupérer la balance de l'adresse stockée
    function getBalance() public view returns (uint) {
        return storedAddress.balance;
    }

    // Fonction pour récupérer la balance d'une adresse passée en paramètre
    function getBalance(address _address) public view returns (uint256) {
        return _address.balance;
    }

     // Fonction pour envoyer des ethers avec transfer
    function transferEther(address _addr) external payable {
        require(msg.value >= 1, "envoi min 1 wei");
        payable(_addr).transfer(msg.value);
    }

    // Fonction pour envoyer des ethers avec transfer
    function transferEtherToAddress(uint balanceMin) external payable {
        require(msg.value >= 1, "envoi min 1 wei");
        require(payable(storedAddress).balance >= balanceMin, "pas assez de fond sur cette adresse");
        payable(storedAddress).transfer(msg.value);
    }
}
