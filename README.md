# Overviews

- Reference source: https://en.wikipedia.org/wiki/Shamir%27s_Secret_Sharing
- Library: https://www.npmjs.com/package/shamirs-secret-sharing
- NFT contract address: https://testnet.bscscan.com/address/0xaE1936Ca0eD5FacA4b69F46b80Bf027AE38E19Bb

<br>

![Alt text](/flow.png "Shamir's Secret Sharing")

# How to use

## Prerequisite
- Input your private key into `PRIVATE_KEY` iitem in `.env` file
- Installing library dependencies
```cmd
npm install
```


## Running share command, split key to be 3 files, export to shares folder

```cmd
npm run shares
```

## Combining 2/3 shared files from shares folder, recover original private key then using that key for minting a NFT 

```cmd
npm run combine
```
