# Задание 4. Создать обновляемый контракт, используя один из стандартов
## Цель:
1. Научиться создавать обновляемый контракт, используя один из стандартов
2. Написать Factory контракт, который создаёт клонированные контракты.


## Описание/Пошаговая инструкция выполнения домашнего задания:
1. Создайте контракт с уровнями доступа.
2. Внедрите мета-транзакции в контракт.
3. Реализуйте функцию permit в ERC20 токене по стандарту ERC2612.
4. Создайте обновляемый контракт, используя один из стандартов Transparent, UUPS либо Beacon.
5. Напишите Factory контракт, который создаёт клонированные контракты.

## Что сделано
Описание логики и тестов в соответствующих файлах контрактов и тестов
1. Уровни доступа реализованы в [контракте MyERC20](./contracts/MyERC20.sol)
2. Пример простой мета транзации реализован в [в контракте SimpleMeta](./contracts/SimpleMeta.sol)
3. Функция permit реализована в [контракте MyERC20](./contracts/MyERC20.sol)
4. Прокси контракт реализован в [контракте Proxy](./contracts/Proxy.sol), имплементация для него в [контракте MyERC20Impliment](./contracts/MyERC20impliment.sol)
5. Factory контракт реализован в [контракте Factory](./contracts/Factory.sol)

## Как запустить тест на локальной машине
Для запуска необходимо, чтобы на локальной машине было установлен программное обеспечение Node js.
1. Необходимо склонировать репозиторий:
```shell
git clone https://github.com/khronic79/solidity-task4.git
```
или
```shell
git clone git@github.com:khronic79/solidity-task4.git
```
2. Установить зависимости для Node js, например:
```shell
npm init
```
3. Запустить тест:
```shell
npx hardhat test
```
