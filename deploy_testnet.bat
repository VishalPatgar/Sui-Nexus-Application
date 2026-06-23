@echo off
echo ==============================================
echo Deploying Sui Nexus to Testnet
echo ==============================================

echo 1. Make sure you have requested testnet gas from the Sui Web Faucet:
echo https://faucet.sui.io/?address=0x02b91a2d693584a11f4e03e0503254fec8de3fb174459a2fe183eb56002b9abc
echo.
pause

echo 2. Publishing the Move Contract...
cd move\sui_nexus
..\..\sui.exe client publish --gas-budget 200000000 --env testnet

echo.
echo If successful, copy the Package ID from the output and update your frontend and backend configuration!
pause
