// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

contract NomDuContrat{
    // commentaires sur le cours : 
    // types de fonctions : private (accessible uniquement depuis ce Smart Contract) 
    // internal plus permissif que private
    // public accessible depuis interieur & exterieur
    // external accessible uniquement depuis l'exterieur du contract
    // view : ne modifie pas l'état du contrat, permet de lire les variables d'état
    

    // State variables
    address myAdress;

    function setAMyddress(address _myAdress) external {
        myAdress = _myAdress;
    }

    function getMyAddress() public view returns (address) {
        return myAdress;
    }

    // Fonction pour récupérer la balance de l'adresse stockée
    function getBalance() public view returns (uint256) {
        return myAdress.balance;
    }

    // Fonction pour récupérer la balance d'une adresse passée en paramètre
    function getBalance(address _address) public view returns (uint256) {
        return _address.balance;
    }

    // Fonction pour envoyer des ethers avec send
    function sendEther(address payable _to) public payable returns (bool) {
        bool sent = _to.send(msg.value);
        require(sent == true, "Failed to send Ether");
        return sent;
    }

    // Fonction pour envoyer des ethers avec transfer
    function transferEther(address payable _to) external payable {
        _to.transfer(msg.value);
    }

    // Fonction pour envoyer des ethers avec call
    function callEther(address payable _to) public payable returns (bool) {
        (bool sent, ) = _to.call{value: msg.value}("");
        return sent;
    }
//20min27

}