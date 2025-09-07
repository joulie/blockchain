import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const SimpleStorageModule = buildModule("SimpleStorageModule", (m) => {
    const number = 5;
    const simpleStorage = m.contract("SimpleStorage", [number]);

    return { simpleStorage }
})

export default SimpleStorageModule;