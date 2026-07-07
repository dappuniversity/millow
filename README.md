# 🏡 HomeVista – Real Estate Marketplace

HomeVista is a modern full-stack real estate platform inspired by Zillow, designed to provide a seamless property search and buying experience. The application combines a responsive React frontend with blockchain technology to enable secure property ownership through NFTs.

## 🚀 Features

- Browse and search property listings
- View detailed property information
- Interactive and responsive user interface
- NFT-based property ownership
- Ethereum wallet integration
- Smart contract-powered property transactions
- Local blockchain development using Hardhat

## 🛠 Tech Stack

### Frontend
- React.js
- JavaScript
- CSS

### Blockchain
- Solidity
- Hardhat
- Ethers.js

### Development & Testing
- Hardhat Network
- Mocha & Chai

---

## 📋 Prerequisites

Before getting started, ensure you have the following installed:

- Node.js (v18 or later recommended)
- npm
- MetaMask (optional for wallet interaction)

---

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/homevista.git
cd homevista
```

### 2. Install dependencies

```bash
npm install
```

---

## ▶️ Running the Project

### Start the local Hardhat blockchain

```bash
npx hardhat node
```

### Deploy the smart contracts

Open a new terminal and run:

```bash
npx hardhat run scripts/deploy.js --network localhost
```

### Run smart contract tests

```bash
npx hardhat test
```

### Start the React application

```bash
npm start
```

The application will be available at:

```
http://localhost:3000
```

---

## 📂 Project Structure

```
├── contracts/          # Solidity smart contracts
├── scripts/            # Deployment scripts
├── test/               # Smart contract tests
├── src/                # React frontend
├── public/             # Static assets
├── hardhat.config.js   # Hardhat configuration
└── package.json
```

---

## 🔗 Future Enhancements

- Property listing creation
- Interactive map integration
- Advanced search filters
- User authentication
- Mortgage calculator
- Image gallery and virtual tours
- IPFS integration for decentralized metadata
- Support for multiple blockchain networks

---

## 📄 License

This project is intended for educational and portfolio purposes.
