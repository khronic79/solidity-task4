import { ethers } from "hardhat";
import { expect } from "chai";
import { Contract } from "ethers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("PROXY КОНТРАКТ", function () {
    let Proxy: any;
    let ERC20Mock: any;
    let proxy: Contract;
    let erc20Mock: Contract;
    let newErc20Mock: Contract;
    let proxyOwner: HardhatEthersSigner;
    let implementationOwner: HardhatEthersSigner;
    let burner: HardhatEthersSigner;
    let minter: HardhatEthersSigner;

    beforeEach(async function () {
        [proxyOwner, implementationOwner, burner, minter] =
            await ethers.getSigners();
        // Развертывание имплиментации ERC20Mock
        ERC20Mock = await ethers.getContractFactory("MyERC20impliment");
        erc20Mock = await ERC20Mock.deploy();
        await erc20Mock.waitForDeployment();
        // Развертывание Proxy с ERC20Mock в качестве имплементации
        Proxy = await ethers.getContractFactory("Proxy");
        proxy = await Proxy.deploy(erc20Mock.target);
        await proxy.waitForDeployment();
        // Инициализация ERC20Mock через прокси
        const erc20ThroughProxy = new ethers.Contract(
            proxy.target,
            ERC20Mock.interface,
            implementationOwner
        );
        await erc20ThroughProxy.initialize();
    });

    it("Адрес имплементации в Proxy должен соответствовать фактическому адресу имплементации", async function () {
        // Получаем адреc имплементации в Proxy
        // Выбираем первый слот стора контракта
        // В нем записан адрес имплементации
        const implementation = await ethers.provider.getStorage(
            await proxy.getAddress(),
            0
        );
        // Отрезаем 26 символов адреса и сравниваем с фактическим адресом имплементации
        expect(ethers.getAddress("0x" + implementation.slice(26))).to.equal(
            erc20Mock.target
        );
    });

    it("Должны вызываться методы имплементации через прокси", async function () {
        // Минт токенов через прокси
        const erc20ThroughProxyByOwner = new ethers.Contract(
            proxy.target,
            ERC20Mock.interface,
            implementationOwner
        );

        await erc20ThroughProxyByOwner.changeMinter(minter.address);

        const erc20ThroughProxyByMinter = new ethers.Contract(
            proxy.target,
            ERC20Mock.interface,
            minter
        );

        await erc20ThroughProxyByMinter.mint(
            minter.address,
            ethers.parseEther("1000")
        );

        // Проверка баланса
        const balance = await erc20ThroughProxyByOwner.balanceOf(
            minter.address
        );
        expect(balance).to.equal(ethers.parseEther("1000"));
    });

    it("Админ имплементации может изменить адрес имплементации", async function () {
        // Развертывание новой имплементации ERC20
        newErc20Mock = await ERC20Mock.deploy();
        await newErc20Mock.waitForDeployment();

        // Обновление имплементации через прокси
        const proxyAsAdmin = new ethers.Contract(
            proxy.target,
            ["function upgradeTo(address newImplementation)"],
            proxyOwner
        );

        await proxyAsAdmin.upgradeTo(await newErc20Mock.getAddress());

        // Проверка новой имплементации
        const implementation = await ethers.provider.getStorage(
            await proxy.getAddress(),
            0
        );
        expect(ethers.getAddress("0x" + implementation.slice(26))).to.equal(
            await newErc20Mock.getAddress()
        );
    });

    it("Не админ не может изменить адрес имплементации", async function () {
        // Попытка обновления имплементации от имени пользователя (не админа)
        const proxyAsUser = new ethers.Contract(
            proxy.target,
            ["function upgradeTo(address newImplementation)"],
            minter
        );

        expect(
            proxyAsUser.upgradeTo(await newErc20Mock.getAddress())
        ).to.be.revertedWithCustomError(proxy, "ProxyDeniedAdminAccess");
    });
});
