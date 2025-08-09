// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Partie 1 : Base du contrat
contract MonContrat {
    
    // Partie 2 : Variable d'état
    address public storedAddress;

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
        payable(_addr).transfer(msg.value);
    }

}
